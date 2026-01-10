import { Injectable, Logger } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FFmpegService {
  private readonly logger = new Logger(FFmpegService.name);

  constructor(private configService: ConfigService) {
    const ffmpegPath = this.configService.get<string>('ffmpeg.path');
    const ffprobePath = this.configService.get<string>('FFPROBE_PATH');

    if (ffmpegPath) {
      this.logger.log(`Setting FFmpeg path to: ${ffmpegPath}`);
      ffmpeg.setFfmpegPath(ffmpegPath);
    }
    if (ffprobePath) ffmpeg.setFfprobePath(ffprobePath);
  }

  async rtspToHLS(rtspUrl: string, outputDir: string, playlistName = 'stream.m3u8', tuning?: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const playlistPath = path.join(outputDir, playlistName);
      const inputOptions = this.buildInputOptions(tuning);

      ffmpeg(rtspUrl)
        .inputOptions(inputOptions)
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

  recordStream(rtspUrl: string, outputDir: string, segmentTime = 60, tuning?: any): any {
    const inputOptions = this.buildInputOptions(tuning);

    const command = ffmpeg(rtspUrl)
      .inputOptions(inputOptions)
      .outputOptions([
        '-c copy',
        '-map 0',
        '-f segment',
        `-segment_time ${segmentTime}`,
        '-segment_format mpegts',
        '-reset_timestamps 1',
        '-strftime 1'
      ])
      .output(path.join(outputDir, 'seg_%Y%m%d_%H%M%S.ts'))
      .on('start', (cmd) => {
        this.logger.log(`Started recording: ${cmd}`);
      })
      .on('error', (err) => {
        this.logger.error(`Recording error: ${err.message}`);
      })
      .on('end', () => {
        this.logger.log(`Recording stopped for ${rtspUrl}`);
      });

    command.run();
    return command;
  }

  private buildInputOptions(tuning?: any): string[] {
    const options = [`-rtsp_transport ${tuning?.rtspTransport || 'tcp'}`];

    if (tuning?.bufferSize) options.push(`-buffer_size ${tuning.bufferSize}`);
    if (tuning?.analyzeDuration) options.push(`-analyzeduration ${tuning.analyzeDuration}`);
    if (tuning?.probeSize) options.push(`-probesize ${tuning.probeSize}`);

    // Packet loss compensation / low latency tuning
    if (tuning?.packetLossCompensation) {
      options.push('-fflags +genpts+discardcorrupt');
    }

    return options;
  }
}
