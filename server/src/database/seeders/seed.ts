import { AppDataSource } from '@/database/data-source';
import { UserEntity, RoleEntity } from '@/database/entities';
import * as bcrypt from 'bcrypt';

async function seedDatabase() {
  console.log('\n🌱 Seeding database...\n');

  await AppDataSource.initialize();

  const roleRepository = AppDataSource.getRepository(RoleEntity);
  const userRepository = AppDataSource.getRepository(UserEntity);

  try {
    // Create default roles
    console.log('📝 Creating default roles...');

    const adminRole = await roleRepository.findOne({ where: { name: 'Admin' } });
    if (!adminRole) {
      const admin = roleRepository.create({
        name: 'Admin',
        description: 'Administrator with full system access',
        permissions: [
          'camera:create',
          'camera:read',
          'camera:update',
          'camera:delete',
          'recording:view',
          'recording:export',
          'user:manage',
          'role:manage',
          'system:configure',
        ],
      });
      await roleRepository.save(admin);
      console.log('  ✅ Admin role created');
    } else {
      console.log('  ⏭️  Admin role already exists');
    }

    const viewerRole = await roleRepository.findOne({ where: { name: 'Viewer' } });
    if (!viewerRole) {
      const viewer = roleRepository.create({
        name: 'Viewer',
        description: 'Read-only access to camera feeds and recordings',
        permissions: ['camera:read', 'recording:view'],
      });
      await roleRepository.save(viewer);
      console.log('  ✅ Viewer role created');
    } else {
      console.log('  ⏭️  Viewer role already exists');
    }

    // Create default admin user
    console.log('\n👤 Creating default admin user...');

    const adminUser = await userRepository.findOne({ where: { email: 'admin@nxvms.local' } });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = userRepository.create({
        username: 'admin',
        email: 'admin@nxvms.local',
        passwordHash: hashedPassword,
        isActive: true,
        roleId: adminRole?.id || '',
        displayName: 'Administrator',
      });
      await userRepository.save(admin);
      console.log('  ✅ Admin user created (username: admin, password: admin123)');
      console.log('  ⚠️  Change password on first login!');
    } else {
      console.log('  ⏭️  Admin user already exists');
    }

    console.log('\n✅ Database seeding completed!\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seedDatabase();
