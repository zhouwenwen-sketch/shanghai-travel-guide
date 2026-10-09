CREATE TABLE `home_page_views` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `event_id` CHAR(36) NOT NULL,
  `visitor_id` CHAR(36) NOT NULL,
  `session_id` CHAR(36) NOT NULL,
  `visit_date` DATE NOT NULL,
  `occurred_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_home_page_views_event` (`event_id`),
  INDEX `idx_home_page_views_date` (`visit_date`),
  INDEX `idx_home_page_views_date_visitor` (`visit_date`, `visitor_id`),
  INDEX `idx_home_page_views_date_session` (`visit_date`, `session_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
