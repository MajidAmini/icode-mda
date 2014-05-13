-- phpMyAdmin SQL Dump
-- version 3.3.8.1
-- http://www.phpmyadmin.net
--
-- Host: 192.168.1.36
-- Generation Time: Feb 09, 2012 at 07:34 PM
-- Server version: 5.5.15
-- PHP Version: 5.2.9-1

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `test`
--

-- --------------------------------------------------------

--
-- Table structure for table `current_vessels`
--

CREATE TABLE IF NOT EXISTS `current_vessels` (
  `MMSI` int(11) NOT NULL DEFAULT '0',
  `CommsID` varchar(40) NOT NULL DEFAULT '0',
  `IMONumber` int(11) DEFAULT NULL,
  `CallSign` varchar(128) DEFAULT NULL,
  `Name` varchar(128) DEFAULT NULL,
  `VesType` varchar(32) DEFAULT NULL,
  `Cargo` varchar(64) DEFAULT NULL,
  `AISClass` double DEFAULT NULL,
  `Length` double DEFAULT NULL,
  `Beam` double DEFAULT NULL,
  `Draft` double DEFAULT NULL,
  `AntOffsetBow` double DEFAULT NULL,
  `AntOffsetPort` double DEFAULT NULL,
  `Destination` varchar(128) DEFAULT NULL,
  `ETADest` int(20) DEFAULT NULL,
  `PosSource` varchar(128) DEFAULT NULL,
  `PosQuality` varchar(128) DEFAULT NULL,
  `TimeOfFix` int(20) DEFAULT NULL,
  `FixDTG` varchar(128) DEFAULT NULL,
  `Latitude` float NOT NULL,
  `Longitude` float NOT NULL,
  `COG` double DEFAULT NULL,
  `SOG` double DEFAULT NULL,
  `Heading` double DEFAULT NULL,
  `ROT` double DEFAULT NULL,
  `NavStatus` varchar(128) DEFAULT NULL,
  `RxStnID` varchar(32) DEFAULT NULL,
  `Source` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`MMSI`,`CommsID`),
  KEY `MMSI` (`MMSI`),
  KEY `Latitude` (`Latitude`),
  KEY `Longitude` (`Longitude`),
  KEY `TimeOfFix` (`TimeOfFix`),
  KEY `Name` (`Name`),
  KEY `RxStnID` (`RxStnID`),
  KEY `VesType` (`VesType`),
  KEY `CommsID` (`CommsID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `current_vessels`
--

INSERT INTO `current_vessels` (`MMSI`, `CommsID`, `IMONumber`, `CallSign`, `Name`, `VesType`, `Cargo`, `AISClass`, `Length`, `Beam`, `Draft`, `AntOffsetBow`, `AntOffsetPort`, `Destination`, `ETADest`, `PosSource`, `PosQuality`, `TimeOfFix`, `FixDTG`, `Latitude`, `Longitude`, `COG`, `SOG`, `Heading`, `ROT`, `NavStatus`, `RxStnID`, `Source`) VALUES
(367437970, '367437970', 0, '', '367437970', '0-Unknown', 'Unknown', 0, 1, 1, 1, 0.5, 0.5, '', 0, 'vdm0', 'Low-0', 1327614851, '20120126215411', 18.5194, -190.045, 262, 22.7, 261, -3.6, '0-Underway(Engine)', 'EXACTEARTH_NRL', 'MSSIS'),
(367086760, '367086760', 0, 'WDC8419', 'Bayislander', '30-Fishing', '0-AllShips', 30, 27, 9, 3, 10, 5, 'Kodiak', 2080000, 'vdm0', 'Low-1', 1328815721, '20120209192841', 57.7851, -152.419, 202, 0, 252, 0, '0-Underway(Engine)', '323380001', 'MSSIS');
