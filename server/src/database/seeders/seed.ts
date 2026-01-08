import { AppDataSource } from '../data-source';
import { UserEntity, RoleEntity } from '../entities';
import * as bcrypt from 'bcrypt';

async function seedDatabase() {
  console.log('\n🌱 Seeding database...\n');

  await AppDataSource.initialize();

  const roleRepository = AppDataSource.getRepository(RoleEntity);
  const userRepository = AppDataSource.getRepository(UserEntity);

  try {
    // Create default roles
    console.log('📝 Creating default roles...');

    let adminRole = await roleRepository.findOne({ where: { name: 'Admin' } });
    if (!adminRole) {
      console.log('    Creating Admin role...');
      const adminRoleData = roleRepository.create({
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
      adminRole = await roleRepository.save(adminRoleData);
      console.log(`    ✅ Admin role created with ID: ${adminRole.id}`);
    } else {
      console.log(`  ⏭️  Admin role already exists with ID: ${adminRole.id}`);
    }

    let viewerRole = await roleRepository.findOne({ where: { name: 'Viewer' } });
    if (!viewerRole) {
      console.log('    Creating Viewer role...');
      const viewerRoleData = roleRepository.create({
        name: 'Viewer',
        description: 'Read-only access to camera feeds and recordings',
        permissions: ['camera:read', 'recording:view'],
      });
      viewerRole = await roleRepository.save(viewerRoleData);
      console.log(`    ✅ Viewer role created with ID: ${viewerRole.id}`);
    } else {
      console.log(`  ⏭️  Viewer role already exists with ID: ${viewerRole.id}`);
    }

    // Create default admin user
    console.log('\n👤 Creating default admin user...');

    const adminUser = await userRepository.findOne({ where: { email: 'admin@nxvms.local' } });
    if (!adminUser) {
      if (!adminRole || !adminRole.id) {
        throw new Error('Admin role must be created before admin user');
      }
      
      console.log(`    Using admin role ID: ${adminRole.id}`);
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUserData = userRepository.create({
        username: 'admin',
        email: 'admin@nxvms.local',
        passwordHash: hashedPassword,
        isActive: true,
        roleId: adminRole.id,
        displayName: 'Administrator',
      });
      await userRepository.save(adminUserData);
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
