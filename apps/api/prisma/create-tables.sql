-- 创建 reports 表
CREATE TABLE IF NOT EXISTS `reports` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `report_number` VARCHAR(50) NOT NULL COMMENT '报告编号（唯一）',
  `report_type` ENUM('INSPECTION_CERT', 'INSTALLATION_INSPECTION') NOT NULL COMMENT '报告类型',
  `inspection_date` DATE NOT NULL COMMENT '检测日期',
  `equipment_name` VARCHAR(200) NOT NULL COMMENT '设备名称',
  `client_company` VARCHAR(200) NOT NULL COMMENT '委托单位',
  `user_company` VARCHAR(200) NOT NULL COMMENT '使用单位',
  `file_url` VARCHAR(500) NOT NULL COMMENT '文件路径（相对于uploads目录）',
  `file_type` ENUM('PDF', 'JPG', 'PNG') NOT NULL COMMENT '文件类型',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_report_number` (`report_number`),
  KEY `idx_inspection_date` (`inspection_date`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='检测报告表';

-- 创建 admins 表
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名（唯一）',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'bcrypt加密后的密码',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';
