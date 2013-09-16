CREATE SCHEMA `test` ;
USE `test`;
CREATE TABLE `ais` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
  `mmsi` VARCHAR( 10 ) NOT NULL ,  
  `name` VARCHAR( 60 ) NOT NULL ,
  `imo` VARCHAR( 10 ) NOT NULL ,
  `lat` FLOAT( 10, 6 ) NOT NULL ,
  `lon` FLOAT( 10, 6 ) NOT NULL ,
  `flag` VARCHAR( 80 ) NOT NULL ,
  `ship_type` VARCHAR( 80 ) NOT NULL ,
  `status` VARCHAR( 80 ) NOT NULL ,
  `speed` VARCHAR( 60 ) NOT NULL ,
  `course` VARCHAR( 60 ) NOT NULL ,
  `length` VARCHAR( 60 ) NOT NULL ,
  `breadth` VARCHAR( 60 ) NOT NULL ,
  `draught` VARCHAR( 60 ) NOT NULL ,
  `destination` VARCHAR( 60 ) NOT NULL ,
  `eta` VARCHAR( 60 ) NOT NULL ,
  `received` VARCHAR( 60 ) NOT NULL
) ENGINE = MYISAM ;

INSERT INTO `ais` (`mmsi`, `name`, `imo`, `lat`, `lon`, `flag`, `ship_type`, `status`, `speed`, `course`, `length`, `breadth`, `draught`, `destination`, `eta`, `received`) VALUES ('mmsi0', 'name0', 'imo0', '-32.974076', '-71.587712', 'flag', 'Unspecified Ships', 'status', 'speed', 'course', 'length', 'breadth', 'draught', 'destination', 'eta', 'received');
INSERT INTO `ais` (`mmsi`, `name`, `imo`, `lat`, `lon`, `flag`, `ship_type`, `status`, `speed`, `course`, `length`, `breadth`, `draught`, `destination`, `eta`, `received`) VALUES ('mmsi1', 'name1', 'imo1', '-32.975075', '-71.588711', 'flag', 'Navigation Aids', 'status', 'speed', 'course', 'length', 'breadth', 'draught', 'destination', 'eta', 'received');
INSERT INTO `ais` (`mmsi`, `name`, `imo`, `lat`, `lon`, `flag`, `ship_type`, `status`, `speed`, `course`, `length`, `breadth`, `draught`, `destination`, `eta`, `received`) VALUES ('mmsi0', 'name0', 'imo0', '-32.979076', '-71.587712', 'flag', 'Fishing', 'status', 'speed', 'course', 'length', 'breadth', 'draught', 'destination', 'eta', 'received');
INSERT INTO `ais` (`mmsi`, `name`, `imo`, `lat`, `lon`, `flag`, `ship_type`, `status`, `speed`, `course`, `length`, `breadth`, `draught`, `destination`, `eta`, `received`) VALUES ('mmsi2', 'name2', 'imo2', '-32.976074', '-71.589710', 'flag', 'Tug, Pilot, etc', 'status', 'speed', 'course', 'length', 'breadth', 'draught', 'destination', 'eta', 'received');
INSERT INTO `ais` (`mmsi`, `name`, `imo`, `lat`, `lon`, `flag`, `ship_type`, `status`, `speed`, `course`, `length`, `breadth`, `draught`, `destination`, `eta`, `received`) VALUES ('mmsi2', 'name2', 'imo2', '-32.976574', '-71.589710', 'flag', 'High Speed Craft', 'status', 'speed', 'course', 'length', 'breadth', 'draught', 'destination', 'eta', 'received');
INSERT INTO `ais` (`mmsi`, `name`, `imo`, `lat`, `lon`, `flag`, `ship_type`, `status`, `speed`, `course`, `length`, `breadth`, `draught`, `destination`, `eta`, `received`) VALUES ('mmsi3', 'name3', 'imo3', '-32.977073', '-71.580709', 'flag', 'Cargo Vessels', 'status', 'speed', 'course', 'length', 'breadth', 'draught', 'destination', 'eta', 'received');
INSERT INTO `ais` (`mmsi`, `name`, `imo`, `lat`, `lon`, `flag`, `ship_type`, `status`, `speed`, `course`, `length`, `breadth`, `draught`, `destination`, `eta`, `received`) VALUES ('mmsi4', 'name4', 'imo4', '-32.978072', '-71.581708', 'flag', 'Passenger Vessel', 'status', 'speed', 'course', 'length', 'breadth', 'draught', 'destination', 'eta', 'received');
INSERT INTO `ais` (`mmsi`, `name`, `imo`, `lat`, `lon`, `flag`, `ship_type`, `status`, `speed`, `course`, `length`, `breadth`, `draught`, `destination`, `eta`, `received`) VALUES ('mmsi5', 'name5', 'imo5', '-32.979171', '-71.582707', 'flag', 'Tanker - Hazard D (Recognizable)', 'status', 'speed', 'course', 'length', 'breadth', 'draught', 'destination', 'eta', 'received');
INSERT INTO `ais` (`mmsi`, `name`, `imo`, `lat`, `lon`, `flag`, `ship_type`, `status`, `speed`, `course`, `length`, `breadth`, `draught`, `destination`, `eta`, `received`) VALUES ('mmsi5', 'name5', 'imo5', '-32.979271', '-71.582707', 'flag', 'Yachts and Others', 'status', 'speed', 'course', 'length', 'breadth', 'draught', 'destination', 'eta', 'received');
INSERT INTO `ais` (`mmsi`, `name`, `imo`, `lat`, `lon`, `flag`, `ship_type`, `status`, `speed`, `course`, `length`, `breadth`, `draught`, `destination`, `eta`, `received`) VALUES ('mmsi5', 'name5', 'imo5', '-32.98171', '-71.582707', 'flag', 'Ships Underway', 'status', 'speed', 'course', 'length', 'breadth', 'draught', 'destination', 'eta', 'received');
INSERT INTO `ais` (`mmsi`, `name`, `imo`, `lat`, `lon`, `flag`, `ship_type`, `status`, `speed`, `course`, `length`, `breadth`, `draught`, `destination`, `eta`, `received`) VALUES ('mmsi5', 'name5', 'imo5', '-32.98371', '-71.582707', 'flag', 'Anchored/Moored', 'status', 'speed', 'course', 'length', 'breadth', 'draught', 'destination', 'eta', 'received');


