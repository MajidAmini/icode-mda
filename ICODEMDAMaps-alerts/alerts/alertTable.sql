CREATE TABLE IF NOT EXISTS `alert_criteria` (
  `vessel_mmsi` DECIMAL(11) DEFAULT NULL,
  `vessel_imo` DECIMAL(11) DEFAULT NULL,
  `vessel_name` varchar(128) DEFAULT NULL,
  `vessel_flag` varchar(128) DEFAULT NULL,
  `vessel_type` DECIMAL(11) DEFAULT NULL,
  `vessel_length` double DEFAULT NULL,
  `vessel_width` DECIMAL(11) DEFAULT NULL, 
  `vessel_draught` DECIMAL(11) DEFAULT NULL, 
  `vessel_destination` VARCHAR(128) DEFAULT NULL, 
  `vessel_callsign` VARCHAR(128) DEFAULT NULL,
  `entering_area` BOOLEAN DEFAULT FALSE,
  `exiting_area` BOOLEAN DEFAULT FALSE,
  `area` POLYGON
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

