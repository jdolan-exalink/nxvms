import { Injectable, Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FFmpegService {
  private readonly logger = new Logger(FFmpegService.name);

  constructor(private configService: ConfigService) {
    const ffmpegPath = this.configService.get<string>('FFMPEG_PATH');
    const ffprobePath = this.configService.get<string>('FFPROBE_PATH');

    if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);
    if (ffprobePath) ffmpeg.setFfprobePath(ffprobePath);
  }

  async rtspToHLS(rtspUrl: string, outputDir: string, playlistName = 'stream.m3u8'): Promise<void> {
    return new Promise((resolve, reject) => {
      const playlistPath = path.join(outputDir, playlistName);

      ffmpeg(rtspUrl)
        .inputOptions(['-rtsp_transport tcp', '-i'])
        .outputOptions([
          '-c:v libx264',
          '-preset fast',
          '-c:a aac',
          '-f hls',
          '-hls_time 4',
          '-hls_playlist_type event',
          '-hls_list_size 10',
          '-hls_flags delete_segments',
        ])
        .output(playlistPath)
        .on('start', (cmd) => {
          this.logger.debug(`Starting HLS conversion: ${cmd}`);
        })
        .on('error', (err) => {
          this.logger.error(`FFmpeg error: ${err.message}`);
          reject(err);
        })
        .on('end', () => {
          this.logger.log(`HLS conversion completed: ${playlistPath}`);
          resolve();
        })
        .run();
    });
  }

  async getStreamInfo(rtspUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(rtspUrl, (err, metadata) => {
        if (err) {
          this.logger.error(`ffprobe error: ${err.message}`);
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  }

  async generateThumbnail(rtspUrl: string, outputPath: string, timestamp = 0): Promise<void> {
    return new Promise((resolve, reject) => {
      const dir = path.dirname(outputPath);

      ffmpeg(rtspUrl)
        .seekInput(timestamp)
        .output(outputPath)
        .outputOptions(['-vf scale=160:90', '-frames:v 1'])
        .on('error', (err) => {
          this.logger.error(`Thumbnail generation error: ${err.message}`);
          reject(err);
        })
        .on('end', () => {
          this.logger.log(`Thumbnail generated: ${outputPath}`);
          resolve();
        })
        .run();
    });
  }

  async transcodeToMP4(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions(['-c:v libx264', '-preset medium', '-c:a aac', '-movflags +faststart'])
        .output(outputPath)
        .on('error', (err) => {
          this.logger.error(`Transcoding error: ${err.message}`);
          reject(err);
        })
        .on('end', () => {
          this.logger.log(`Transcoding completed: ${outputPath}`);
          resolve();
        })
        .run();
    });
  }
}
