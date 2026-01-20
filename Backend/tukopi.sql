-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 15, 2026 at 04:21 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tukopi`
--

-- --------------------------------------------------------

--
-- Table structure for table `cashiers`
--

CREATE TABLE `cashiers` (
  `USER_ID` char(8) NOT NULL,
  `USERNAME` varchar(45) NOT NULL,
  `ADDRESS` varchar(100) NOT NULL,
  `PLACE_OF_BIRTH` varchar(25) NOT NULL,
  `DATE_OF_BIRTH` date NOT NULL,
  `CONTACT_NUMBER` varchar(14) NOT NULL,
  `EMAIL` varchar(40) NOT NULL,
  `GENDER_ID` char(1) NOT NULL,
  `CREATED_AT` datetime NOT NULL,
  `UPDATED_AT` datetime NOT NULL,
  `PASSWORD` varchar(35) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cashiers`
--

INSERT INTO `cashiers` (`USER_ID`, `USERNAME`, `ADDRESS`, `PLACE_OF_BIRTH`, `DATE_OF_BIRTH`, `CONTACT_NUMBER`, `EMAIL`, `GENDER_ID`, `CREATED_AT`, `UPDATED_AT`, `PASSWORD`) VALUES
('12345678', 'sulthan', 'Jl. Kaligangsa Asri Timur VII No. 33 RT 3 RW 7 Kaligangsa Margadana Tegal 52147', 'Tegal', '1983-08-03', '085742288110', 'n3k4ther.otr@gmail.com', 'L', '2025-11-16 00:00:00', '2025-11-16 00:00:00', 'Indonesia'),
('24090038', 'sofyan', 'Jalan Hanoman, Slerok, Kota Tegal, Jawa Tengah', 'Tegal', '2004-11-18', '089605997177', 'syafitraarda@gmail.com', 'L', '2025-11-16 00:00:00', '2025-11-16 00:00:00', 'Indonesia'),
('24090056', 'arda', 'Gang Seroja 9 , Desa Ujungrusi RT6/1 , Kec Adiwerna Kabupaten Tegal', 'Tegal', '2006-03-29', '082328275457', 'hammamghazi54@gmail.com', 'L', '2025-11-16 00:00:00', '2025-11-16 00:00:00', 'Indonesia'),
('24090131', 'riski', 'Kajen - Talang - Kab.Tegal', 'Tegal', '2006-04-22', '081542235634', 'muhammad.irhas108@gmail.com', 'L', '2025-11-16 00:00:00', '2025-11-16 00:00:00', 'Indonesia'),
('24090138', 'tuko', 'Jl. Mliwis Gg. Walet No.9', 'Tegal', '2003-08-05', '085962891782', 'dawgsyogs@gmail.com', 'L', '2025-11-16 00:00:00', '2025-11-16 00:00:00', 'Indonesia');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `CUST_ID` char(8) NOT NULL,
  `CUST_NAME` varchar(45) NOT NULL,
  `ADDRESS` varchar(100) NOT NULL,
  `PLACE_OF_BIRTH` varchar(25) NOT NULL,
  `DATE_OF_BIRTH` date DEFAULT NULL,
  `CONTACT_NUMBER` varchar(14) NOT NULL,
  `EMAIL` varchar(40) NOT NULL,
  `GENDER_ID` char(1) NOT NULL,
  `CREATED_AT` datetime DEFAULT NULL,
  `CREATED_BY` varchar(35) DEFAULT NULL,
  `UPDATED_AT` datetime DEFAULT NULL,
  `UPDATED_BY` varchar(35) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`CUST_ID`, `CUST_NAME`, `ADDRESS`, `PLACE_OF_BIRTH`, `DATE_OF_BIRTH`, `CONTACT_NUMBER`, `EMAIL`, `GENDER_ID`, `CREATED_AT`, `CREATED_BY`, `UPDATED_AT`, `UPDATED_BY`) VALUES
('-NoName-', '-Nama Tidak Terdaftar-', '-NoName-', '-NoName-', '1945-08-17', '-NoName-', 'papa', 'L', '2025-11-16 00:00:00', 'papa', '2025-11-16 00:00:00', 'TAMU'),
('12345678', 'Taufiq Abidin', 'J. Kaligangsa Asri Timur VIII No 33 RT 3 RW 7 Kel. Kaligangsa Kec. Margadana Kota Tegal 52147', 'Tegal', '1983-08-03', '085742288110', 'taufiq.abidin@poltektegal.ac.id', 'L', '2025-11-16 00:00:00', 'taufiq.abidin@poltektegal.ac.id', '2025-11-16 00:00:00', 'TAMU'),
('23090100', 'SUFI AHMAD TIARA FIGAR', 'DESA SIGAMBIR KEC BREBES KAB BREBES RTO1 RW01', 'BREBES', '2205-05-11', '091990343964', 'SUFIAKHMAD3964@GMAIL.COM', 'L', '2025-11-16 00:00:00', '', '2025-11-16 00:00:00', ''),
('23090128', 'Toriq Azizurrochman', 'jln kh abdurrohman, rt 11/rw 06, desa sidoharjo, kecamatan suradadi, kabupaten tegal, 52182', 'Tegal', '2004-11-10', '089504094094', 'toriqsmpll31@gmail.com', 'L', '2025-11-16 00:00:00', 'toriqsmpll31@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090001', 'Zahra Meidinah Tahsya', 'Jln.sunan kudus, kaligangsa kulon, brebes', 'Brebes', '2006-05-24', '089673169299', 'zahrameidinah05@gmail.com', 'P', '2025-11-16 00:00:00', 'zahrameidinah05@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090002', 'Mohammad Fatih Mubarok', 'JL. Samratulangi Pasar Batang Brebes no 50', 'Brebes', '2006-08-31', '088227682867', 'mubarokfatih562@gmail.com', 'L', '2025-11-16 00:00:00', 'mubarokfatih562@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090003', 'ANDRA SETYA RAMADHANI', 'Jl.kapten sudibyo no 137B', 'Tegal', '2005-10-16', '088220007296', 'andrasetya856@gmail.com', 'L', '2025-11-16 00:00:00', 'andrasetya856@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090004', 'Adi Salam Ramdani', 'Jl Raya Tembok Lor, Desa Tembok Lor RT 03/RW 13, Kec. Adiwerna, Kab. Tegal', 'Tegal', '2005-10-05', '089666861497', 'adisalamramdani05@gmail.com', 'L', '2025-11-16 00:00:00', 'adisalamramdani05@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090006', 'Akhmad Ridwan Ariyanto', 'Perum Kaladawa', 'Pemalang', '2025-06-25', '085802874829', 'akhmadridwan357@gmail.com', 'L', '2025-11-16 00:00:00', 'akhmadridwan357@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090008', 'Andira Finna Nareswari', 'Jl Dr Wahidin, Saditan Brebes', 'Brebes', '2005-12-15', '08816776347', 'andirafinnanareswari@gmail.com', 'P', '2025-11-16 00:00:00', 'andirafinnanareswari@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090009', 'EKA DZAKWAN VENARINDRA', 'Jl. Teuku Cik Ditiro', 'Brebes', '2005-09-10', '081215262823', 'ekadzakwan59@gmail.com', 'L', '2025-11-16 00:00:00', 'ekadzakwan59@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090010', 'inays imaratu eliza', 'Korea', 'Seoul', '2005-08-02', '085143219133', 'inaysssimaratu@gmail.com', 'P', '2025-11-16 00:00:00', 'inaysssimaratu@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090011', 'Noval Oktamuza', 'Jl. Semanggi Raya No. 120, Mejasem Barat, Kramat, Kab.Tegal', 'Tegal', '1999-10-14', '082124928879', 'oktamuzanoval@gmail.com', 'L', '2025-11-16 00:00:00', 'oktamuzanoval@gmail.com', '2025-11-16 00:00:00', 'oktamuzanoval@gmail.com'),
('24090012', 'Raditya Wildan Assyaif', 'Kecamatan Adiwerna, Kabupaten Tegal', 'Tegal', '2006-08-08', '085225384588', 'radityawildan33@gmail.com', 'L', '2025-11-16 00:00:00', 'radityawildan33@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090013', 'MUHAMAD FATHUL HUDA', 'JL.WERKUDORO NO 41', 'TEGAL', '2006-05-23', '089619118295', 'muhfathulhuda24090013@gmail.com', 'L', '2025-11-16 00:00:00', 'muhfathulhuda24090013@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090014', 'Vina Maulidah', 'Jl.Kuncung RT04 RW06 Wanatawang Yamansari Kec. Lebaksiu Kab. Tegal', 'Tegal', '2006-03-27', '085866233452', 'vinamaulidah27@gmail.com', 'P', '2025-11-16 00:00:00', 'vinamaulidah27@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090015', 'Naelanisa Aprilia Khumaedi', 'Tegal', 'Tegal', '2006-04-26', '087835288533', 'naelanisa45@gmail.com', 'P', '2025-11-16 00:00:00', 'naelanisa45@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090016', 'Dimas Sahputra', 'Ds. Bongkok Kec. Kramat Kab. Tegal', 'Tegal', '2006-08-26', '087834370388', 'sahputradimas268@gmail.com', 'L', '2025-11-16 00:00:00', 'sahputradimas268@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090017', 'Nayla zalfa zahiyah', 'Jl. Anggrek Ds. Banjaranyar', 'TEGAL', '2005-12-23', '085292802447', 'naylazalfa03@gmail.com', 'P', '2025-11-16 00:00:00', 'naylazalfa03@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090018', 'Nissa Intan Nurani', 'Tegal', 'Tegal', '2005-05-21', '083820931296', 'intanissaa21@gmail.com', 'P', '2025-11-16 00:00:00', 'intanissaa21@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090020', 'm faizal faiz', 'kalkul, margadana, rt04rw05', 'tegal', '2010-10-07', '085870004152', 'faizalfaiz645@gmail.com', 'L', '2025-11-16 00:00:00', 'faizalfaiz645@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090022', 'Muchammad Machyanut Tuko', 'Jl.Mejabung', 'Tegal', '2010-04-06', '085641066079', 'muchammadmachyanuttuko@gmail.com', 'L', '2025-11-16 00:00:00', 'muchammadmachyanuttuko@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090023', 'Tanwirul Khasanah', 'Jl. Kedung SIlami RT 23 RW 06 Kel. Pagiyanten Kec. Adiwerna Kab. Tegal 52194', 'Tegal', '2004-09-11', '0895385900007', 'tanwirulkhasanah@gmail.com', 'P', '2025-11-16 00:00:00', 'tanwirulkhasanah@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090024', 'Indah Fitriyani', 'Jl. Jawa', 'Tegal', '2025-10-29', '089604072496', 'indhftryni23@gmail.com', 'P', '2025-11-16 00:00:00', 'indhftryni23@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090025', 'Riski Ramadhan', 'Jl.Kleben Desa Gembong Kulon Rt01/Rw01', 'Tegal', '2005-10-30', '0895379178780', 'rizkiramadhanrizki36484@gmail.com', 'L', '2025-11-16 00:00:00', 'rizkiramadhanrizki36484@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090026', 'Devita Anggraeni', 'Desa Purwahamba, Kecamatan Suradadi, Kabupaten Tegal', 'Tegal', '2006-06-23', '085225302710', 'devitanggra23@gmail.com', 'P', '2025-11-16 00:00:00', 'devitanggra23@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090027', 'Pranada Al Fath Refandra', 'Jln Karimunjawa', 'Kota Tegal', '2006-07-12', '085225756709', 'pranadaalfath@gmail.com', 'L', '2025-11-16 00:00:00', 'pranadaalfath@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090028', 'Dwi Riski Ariyanto', 'pekauman kulon rt3/3', 'tegal', '2010-09-23', '0895606401740', 'dwiriski2209@gmail.com', 'L', '2025-11-16 00:00:00', 'dwiriski2209@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090029', 'Lazuardi Augian Pratama', 'Griya Satria Dampyak Blok I No.19, Dampyak Lor, Dampyak, Tegal', 'Pekalongan', '2005-08-09', '087740297720', 'notzuardboah@gmail.com', 'L', '2025-11-16 00:00:00', 'notzuardboah@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090030', 'Hanif Azhar', 'Brebes, Desa Pesantunan, Jl. Teuku Cik Ditiro', 'Brebes', '2005-06-01', '087711865157', 'hanifazharre@gmail.com', 'L', '2025-11-16 00:00:00', 'hanifazharre@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090032', 'Nagata Darmawan', 'Jln.Gatotkaca Rt10/04,Gumayun,Dukuhwaru Kab.Teagl', 'Tegal', '2004-11-09', '0895384246249', 'nagata.2140@gmail.com', 'L', '2025-11-16 00:00:00', 'nagata.2140@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090033', 'Rafi Faiz Amalta', 'Slawi kulon Kecamatan Slawi Kabupaten Tegal', 'Tegal', '2006-03-21', '0895378169023', 'rafifaiz381@gmail.com', 'L', '2025-11-16 00:00:00', 'rafifaiz381@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090034', 'Angga dwi resky maulana', 'babakan', 'tegal', '2010-11-11', '089619636307', 'dwi789682@gmail.com', 'L', '2025-11-16 00:00:00', 'dwi789682@gmail.com', '2025-11-16 00:00:00', 'dwi789682@gmail.com'),
('24090035', 'Fatimatuz Zahro', 'Desa Pengabean, Kec. Dukuhturi, Kab. Tegal', 'Tegal', '2005-08-29', '085712362447', 'f56446473@gmail.com', 'P', '2025-11-16 00:00:00', 'f56446473@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090037', 'Ain Jelita Ikhwati', 'Jalan Slamet Riyadi, Gang Nangka, Cabawan, Margadana, Kota Tegal, Jawa Tengah, 52147', 'Bogor', '2006-03-02', '087872274726', 'ainjelitaikh@gmail.com', 'P', '2025-11-16 00:00:00', 'ainjelitaikh@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090038', 'Muhammad Arda Syafitra', 'Jalan Hanoman, Slerok, Kota Tegal, Jawa Tengah', 'Tegal', '2004-11-18', '089605997177', 'syafitraarda@gmail.com', 'L', '2025-11-16 00:00:00', 'syafitraarda@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090039', 'Intan Tri Hartati', 'Jl H Abdul Ghoni, RT/RW 004/003, Kel. Pesurungan Kidul', 'Tegal', '2007-01-27', '082211199390', 'intantri2006@gmail.com', 'P', '2025-11-16 00:00:00', 'intantri2006@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090040', 'Mukhamad Adam Mulabib', 'kec.Talang, kab.Tegal', 'Tegal', '2006-02-08', '081325321609', 'adammulabib03@gmail.com', 'L', '2025-11-16 00:00:00', 'adammulabib03@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090042', 'Bagus satrio mahardika', 'kecamatan Taman Kabupaten Pemalang Provinsi Jawa Tengah', 'Pemalang', '2005-08-14', '085640244383', 'bagussatriomahardika78@gmail.com', 'L', '2025-11-16 00:00:00', 'bagussatriomahardika78@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090043', 'Salsabilla Ayu Rizkia', 'Jalan masjid, Belakang toko nani,Tarub,Kab.Tegal,Jawa Tengah', 'TEGAL', '2007-01-14', '082123796275', 'salsabillaayu147@gmail.com', 'P', '2025-11-16 00:00:00', 'salsabillaayu147@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090045', 'Muhamad Ilyas', 'Desa Gumalar RT 05 RW 01 Kec.Adiwerna Kab.Tegal', 'Tegal', '2006-04-28', '089524358844', 'ilyasgumalar@gmail.com', 'L', '2025-11-16 00:00:00', 'ilyasgumalar@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090050', 'Muhamad Safrudin', 'Jalan Sangir No.2', 'Tegal', '2005-02-14', '082313089094', 'mhmdsfrdn1521@gmail.com', 'L', '2025-11-16 00:00:00', 'mhmdsfrdn1521@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090052', 'Maula adiba mufadol', 'jl kyai maja No 03', 'tegal', '2006-05-11', '089638829911', 'adibamufadhol@gmail.com', 'L', '2025-11-16 00:00:00', 'adibamufadhol@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090055', 'Giska Aura Muhamad Prasetyo', 'JL ABDUL SYUKUR PERUMAHAN JAYA KUSUMA BLOK F NO 6', 'Tegal', '2006-01-15', '087822630621', 'ruokrawl@gmail.com', 'L', '2025-11-16 00:00:00', 'ruokrawl@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090056', 'Muhammad Hammam Ghazi', 'Gang Seroja 9 , Desa Ujungrusi RT6/1 , Kec Adiwerna Kabupaten Tegal', 'Tegal', '2006-03-29', '082328275457', 'hammamghazi54@gmail.com', 'L', '2025-11-16 00:00:00', 'hammamghazi54@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090057', 'Pasya Pratama Widianto', 'Jl. Lele', 'Tegal', '2010-10-21', '082226362081', 'pasyapratama209@gmail.com', 'L', '2025-11-16 00:00:00', 'pasyapratama209@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090058', 'Nur Ivan Endrarafif', 'Desa Pegirikan', 'Tegal', '2005-12-01', '085712245528', 'nurivan2005@gmail.com', 'L', '2025-11-16 00:00:00', 'nurivan2005@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090060', 'AKBAR RIZQI AINUL YAQIN', 'Jl.Dewi Sartika', 'Brebes', '2006-03-06', '082313054691', 'akbar.rizqi.ay@gmail.com', 'L', '2025-11-16 00:00:00', 'akbar.rizqi.ay@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090061', 'Muhammad Azfa Rizanta', 'Jl. Pala barat 1 blok B No. 12 RT02 RW09 Kel. Mejasem Barat Kec. kramat Kab.Tegal', 'Tegal', '2010-01-25', '087865168055', 'muhammadazfa119@gmail.com', 'L', '2025-11-16 00:00:00', 'muhammadazfa119@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090062', 'BINAR MAULLAZAQI', 'JL.Sultan Agung no.88A', 'Brebes', '2006-04-29', '085280945349', 'binarzzzzz@gmail.com', 'L', '2025-11-16 00:00:00', 'binarzzzzz@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090063', 'Yafi\' Abhinaya', 'Perumahan Griya Santika Blok H.10', 'Tegal', '2005-12-06', '082132932733', 'yafiabny110@gmail.com', 'L', '2025-11-16 00:00:00', 'yafiabny110@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090064', 'Muhammad Zaim El Yafi', 'Jl. Ma\'ad 57-33, Balapulang Wetan, Kec. Balapulang, Kabupaten Tegal, Jawa Tengah 52464', 'Tegal', '2007-02-24', '081546161160', 'zaimelyafi24@gmail.com', 'L', '2025-11-16 00:00:00', 'zaimelyafi24@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090065', 'Desta Putra Habibie', 'Desa tonggara kecamatan kedungbanteng kabupaten tegal', 'Bekasi', '2005-12-10', '082220987443', 'destahabibi244@gmail.com', 'L', '2025-11-16 00:00:00', 'destahabibi244@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090066', 'Gusti Rizqi Putra Hanif', 'Brebes,Bulakamba,Jalan Kauman Kluwut', 'Brebes', '2006-09-28', '082326261094', 'zekeygemers@gmail.com', 'L', '2025-11-16 00:00:00', 'zekeygemers@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090067', 'YUSUF', 'Durensawit rt 01 rw 03 kec.lebaksiu', 'Tegal', '2005-12-28', '0895321639531', 'yusuf281225@gmail.com', 'L', '2025-11-16 00:00:00', 'yusuf281225@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090068', 'Bagus Prasetyo', 'Jl.Cemara No 48 Griya Praja Pasar Batang Brebes', 'Brebes', '2005-06-10', '085225905320', '10bagusprasetyo@gmail.com', 'L', '2025-11-16 00:00:00', '10bagusprasetyo@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090069', 'Mohamad Naufal Arizal', 'Perum MUTIARA SALBI JL Klampis Barat Blok A 21, Karang Sembung Lor, Karangsembung, Kec. Songgom, Kab', 'Bekasi', '2006-10-18', '089697408401', 'naufalarizal257@gmail.com', 'L', '2025-11-16 00:00:00', 'naufalarizal257@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090070', 'Ramdani Ardhin Pasha', 'Perumahan Mutiara Vantavin 1, Desa Pacul, Kec.Talang, Kab.Tegal', 'Tegal', '2006-10-11', '087719028463', 'ardhinpasha@gmail.com', 'L', '2025-11-16 00:00:00', 'ardhinpasha@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090071', 'Adies Ardiansyah', 'Desa KUTA RT03/RW04 KEC.BANTARBOLANG KAB. PEMALANG', 'SURABAYA', '2006-05-29', '081217627226', 'adiesadiansah6@gmail.com', 'L', '2025-11-16 00:00:00', 'adiesadiansah6@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090072', 'Alief Satrio', 'Kab. Pemalang, Kec. Moga, Desa Moga Jalan Cempaka Rt001/Rw006', 'Pemalang', '2005-06-28', '085712015809', 'alifsatrio757@gmail.com', 'L', '2025-11-16 00:00:00', 'alifsatrio757@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090073', 'Naiya Resda Novalia', 'Desa Dukuhjati Wetan RT09/RW05, Kec.Kedungbanteng, Kab.Tegal', 'Tegal', '2005-11-26', '085802764729', 'naiyaresda@gmail.com', 'P', '2025-11-16 00:00:00', 'naiyaresda@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090074', 'Faizal Isman', 'Jl Abimanyu Gg 5 Slerok, Tegal Timur, Kota Tegal', 'Tegal', '2006-02-08', '082324913246', 'isman.faizal2006@gmail.com', 'L', '2025-11-16 00:00:00', 'isman.faizal2006@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090075', 'Ferdi Saputra', 'Desa Bulakwaru RT 07/RW 03', 'TEGAL', '2005-12-20', '085328901825', 'sptraferdi413@gmail.com', 'L', '2025-11-16 00:00:00', 'sptraferdi413@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090076', 'Ezra Tito Saleh', 'jln.mawar Ds.Mindaka rt06/01, Kec.Tarub, Kab. Tegal', 'Jakarta', '2006-02-08', '085640405943', 'ezratitosaleh8@gmail.com', 'L', '2025-11-16 00:00:00', 'ezratitosaleh8@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090077', 'Arya Ahmad Zakaria', 'harjosarilor,adiwerna', 'kuningan', '2005-04-04', '0805320990090', 'aryazakaria445@gmail.com', 'L', '2025-11-16 00:00:00', 'aryazakaria445@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090078', 'Daffa Amri Hizbullah', 'Jl.candi moncol rt02/02. Kec.dukuhturi kab.tegal', 'Tegal', '2005-09-03', '085326654926', 'chuloappa@gmail.com', 'L', '2025-11-16 00:00:00', 'chuloappa@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090081', 'Galuh Gunawan', 'Desa Pucangluwuk RT 04 RW 01 Kec.Bojong Kab.Tegal', 'Tegal', '2006-05-18', '088232405191', 'galuhgunawan914@gmail.com', 'L', '2025-11-16 00:00:00', 'galuhgunawan914@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090082', 'Najwa Giar Eka Azzahra', 'Pgerbarang Rt 01 Rw 02', 'TEGAL', '2005-07-07', '081917215136', 'najwagiar@gmail.com', 'P', '2025-11-16 00:00:00', 'najwagiar@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090083', 'Syifa Khaerunisa Nabila', 'Jl.Jendral Sudirman Rt 02 Rw 06 Slawi Kulon', 'Tegal', '2006-10-11', '087761047814', 'syifanabila183@gmail.com', 'P', '2025-11-16 00:00:00', 'syifanabila183@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090084', 'Imam Arif Fauzan', 'Desa Maribaya, Kecamatan Kramat Kabupaten Tegal', 'Tegal', '2007-01-26', '089652848630', 'fauzanimam955@gmail.com', 'L', '2025-11-16 00:00:00', 'fauzanimam955@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090085', 'mahmudah amalia putri', 'JL.TEUKU CIKDITIRO, PESANTUNAN RT 04/02-KAB .BREBES', 'Brebes', '2005-12-25', '085894091994', 'idahmahmudah504@gmail.com', 'P', '2025-11-16 00:00:00', 'idahmahmudah504@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090086', 'Khurrotul Aeny', 'Desa Mangunsaren Kec.Tarub Kab.Tegal', 'Tegal', '2005-12-30', '085702245923', 'qurrotulaeni281@gmail.com', 'P', '2025-11-16 00:00:00', 'qurrotulaeni281@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090087', 'Yusuf Maulana Syifa', 'Jl Ababil Rt 07 Rw 01 Randugunting, Tegal Selatan Kota Tegal', 'Brebes', '2004-10-25', '085710872795', 'yusufmaulanasyifa25@gmail.com', 'L', '2025-11-16 00:00:00', 'yusufmaulanasyifa25@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090088', 'Fitria Ramadhani', 'Ds.Kebonagung rt.09/rw.02, kec. Jatibarang , kab. Brebes, Prov. Jawa Tengah, Indonesia', 'Wosu', '2005-11-01', '0882006057034', 'dindafitria283@gmail.com', 'P', '2025-11-16 00:00:00', 'dindafitria283@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090092', 'Almas Jaufilael Syarofina', 'Jl.Raya Timur Pagerbarang Kec. Pagerbarang, Kab.Tegal', 'Tegal', '2005-10-25', '082137289076', 'almassyarfina@gmail.com', 'P', '2025-11-16 00:00:00', 'almassyarfina@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090093', 'Fajar Abdul Aziz', 'Dinuk, RT 02/02, Kecamatan Kramat, Kabupaten Tegal', 'Tegal', '2006-08-07', '083899216097', 'fajarabdulaziz259@gmail.com', 'L', '2025-11-16 00:00:00', 'fajarabdulaziz259@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090094', 'Alif Avicena Alfitrah', 'Desa Tembokluwung, Kec. Adiwerna, Kab. Tegal', 'Tegal', '2007-07-29', '085290447862', 'alifilhamicena@gmail.com', 'L', '2025-11-16 00:00:00', 'alifilhamicena@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090095', 'Rafa Intinanzah Wibisono', 'Desa Bulakamba, Kec.Bulakamba, Kab.Brebes', 'Brebes', '2006-05-31', '085279233725', 'rafaintinanzah31@gmail.com', 'L', '2025-11-16 00:00:00', 'rafaintinanzah31@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090096', 'Muhammad Afin Aditya', 'Ds. Tembok Lor 09/02, Kec. Adiwerna, Kab. Tegal', 'Tegal', '2004-06-16', '62882007730579', 'akungameku1606@gmail.com', 'L', '2025-11-16 00:00:00', 'akungameku1606@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090097', 'Nur Laela Suci Safitri', 'Desa Demangharjo rt/rw 02/01 Kecamatan Warureja Kabupaten Tegal', 'Tegal', '2006-10-23', '0882008254161', 'nurlaelasucisafitri@gmail.com', 'P', '2025-11-16 00:00:00', 'nurlaelasucisafitri@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090098', 'Siti Triyanah', 'Tarub', 'Tegal', '2006-09-06', '08818658120', 'triyanah066@gmail.com', 'P', '2025-11-16 00:00:00', 'triyanah066@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090099', 'Rhegard Putra Davinto', 'Perumahan Griya Tiara Arum blok S12 rt2/rw5,kagok,slawi,Kab Tegal', 'Magetan', '2006-03-27', '085747598070', 'rhegaraa5x@gmail.com', 'L', '2025-11-16 00:00:00', 'rhegaraa5x@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090100', 'Vaena Miftakhur Risko', 'Suradadi', 'Tegal', '2006-09-02', '081233606302', 'vaenamiftakhurrisko@gmail.com', 'P', '2025-11-16 00:00:00', 'vaenamiftakhurrisko@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090101', 'Amirul Madjid Ibrahim', 'JL Temanggung. Gg Bawal 4 RT.02/RW.04 NO 74. Kelurahan Margadana', 'Purbalingga', '2005-10-06', '085725362878', 'mantapkaliboos@gmail.com', 'L', '2025-11-16 00:00:00', 'mantapkaliboos@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090102', 'Mustofa Achmad', 'Tegal Selatan,Debong kidul', 'Tegal', '2004-09-17', '081977723991', 'mustofaahmad200319@gmail.com', 'L', '2025-11-16 00:00:00', 'mustofaahmad200319@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090103', 'Happy Citra Lestari', 'Randugunting', 'Tegal', '2006-07-06', '085640254423', 'happycitralestari0@gmail.com', 'P', '2025-11-16 00:00:00', 'happycitralestari0@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090104', 'Muhammad Abdan Annur', 'Jl. Kenanga Selatan No. 24', 'Tegal', '2005-10-26', '085229110565', 'abdan.annur123@gmail.com', 'L', '2025-11-16 00:00:00', 'abdan.annur123@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090105', 'Yusuf Yudha Ramadhani', 'Jalan Werkudoro Gg.Kalimasada No.7 RT 04.RW.05 Kel Slerok Kec.Tegal Timur Kota Tegal', 'Tegal', '2012-10-10', '087711126798', 'siktinhero@gmail.com', 'L', '2025-11-16 00:00:00', 'siktinhero@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090106', 'Ade Anang Kurniawan', 'Ds.Getaskerep kec. Talang Kab. Tegal', 'Tegal', '2006-06-11', '08819725510', 'adeanangkurniawan@gmail.com', 'L', '2025-11-16 00:00:00', 'adeanangkurniawan@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090107', 'Irfan Maulana Saputra', 'Ds.Kemuning Dk.Bulu rt.03 rw.04', 'Serang', '2003-08-09', '081945354196', 'irfanmaulanasaputra19@gmail.com', 'L', '2025-11-16 00:00:00', 'irfanmaulanasaputra19@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090108', 'Muhammad Satria Prayoga', 'Desa Pedagangan Rt 01/01 Kecamatan Dukuhwaru', 'Tegal', '2006-05-05', '085943410458', 'strprayoga8@gmail.com', 'L', '2025-11-16 00:00:00', 'strprayoga8@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090109', 'Akhmad Faiq Mursyidi', 'jl. jalak janegara jatibarang brebes', 'Brebes', '2010-05-17', '082323816404', 'akhmadfaiqm@gmail.com', 'L', '2025-11-16 00:00:00', 'akhmadfaiqm@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090110', 'Muhammad Lutfi Syauqi Annafal', 'desa kalimati, kec adiwerna, kab.tegal', 'Tegal', '2006-06-28', '085879504442', 'nafallutfi123@gmail.com', 'L', '2025-11-16 00:00:00', 'nafallutfi123@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090111', 'Denta Adi Ramadhani', 'Jl. Teuku Cik Ditiro No. 3', 'brebes', '2003-11-04', '089658059970', 'fantasyjr6@gmail.com', 'L', '2025-11-16 00:00:00', 'fantasyjr6@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090112', 'dwiki raditya mubarok', 'Ujungrusi, Jln kemuning 2, no 15 Rt10/01, Adiwerna, Kab.Tegal, Jawa Tengah', 'Tegal', '2006-11-04', '0882-3867-5733', 'dwikiraditya207@gmail.com', 'L', '2025-11-16 00:00:00', 'dwikiraditya207@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090113', 'Dhiyaulhaq Fakhri Mohammad', 'RT 11 RW 03 Jalan bedug Desa Pegirikan Kecamatan Talang Kabupaten Tegal', 'Tegal', '2006-08-11', '085640724421', 'dhiyaulhaqfakhrimohammad@gmail.com', 'L', '2025-11-16 00:00:00', 'dhiyaulhaqfakhrimohammad@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090114', 'Farih Amrullah \'Aly', 'Jl. Anggrek 1 RT.04 RW 03 Kel.Karangasem Kec.Margasari Kab.Tegal', 'Tegal', '2006-12-27', '0895376070070', 'farihaly11@gmail.com', 'L', '2025-11-16 00:00:00', 'farihaly11@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090115', 'Moh Kahfi Kurniawan', 'Jl Srigunting No 15 A, RT 07, RW 08, Kelurahan Randugunting, Kecamatan Tegal Selatan', 'Tegal', '2006-03-25', '082226072504', 'kahfikurniawan06@gmail.com', 'L', '2025-11-16 00:00:00', 'kahfikurniawan06@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090116', 'Ayu Seftiani', 'Desa Lebeteng Kecamatan Tarub', 'Tegal', '2005-04-09', '081901094818', 'ayu32194@gmail.com', 'P', '2025-11-16 00:00:00', 'ayu32194@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090117', 'SYAMSUL HIDAYATULLOH', 'Sikancil, Slatri, Kec. Larangan, Kabupaten Brebes, Jawa Tengah', 'BREBES', '2005-05-23', '085786947364', 'samsulhidayah384@gmail.com', 'L', '2025-11-16 00:00:00', 'samsulhidayah384@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090118', 'Halim Wiko Abiyunna', 'Jalan gelatik Rt2 Rw2, Desa Pakulaut, Kec Margasari, Tegal, Jateng', 'Tegal', '2005-12-05', '085876401764', 'halimabiyuna@gmail.com', 'L', '2025-11-16 00:00:00', 'halimabiyuna@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090119', 'Veby Rokhmatul Ambiya', 'Jawa tengah,Tegal,Bumijawa', 'Tegal', '2004-02-09', '085643315371', 'vebyambiya@gmail.com', 'L', '2025-11-16 00:00:00', 'vebyambiya@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090120', 'Tesa dian saputri', 'desa penarukan rt 18rw04 kec adiwerna kab tegal', 'TEGAL', '2006-02-28', '0895704328732', 'tesadiansaputri@gmail.com', 'P', '2025-11-16 00:00:00', 'tesadiansaputri@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090122', 'Aurelio Deca Setyawan', 'Desa. Kesadikan, Kec. Tarub, Kab. Tegal', 'Tegal', '2004-05-19', '085801027103', 'aureliodeca1955@gmail.com', 'L', '2025-11-16 00:00:00', 'aureliodeca1955@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090123', 'bagus prasojo', 'Desa Pagongan kec dukuhturi kab.Tegal', 'Tegal', '2006-10-04', '087725345162', 'bagusprasojo666@gmail.com', 'L', '2025-11-16 00:00:00', 'bagusprasojo666@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090124', 'Febryan Valentyo', 'Brebes', 'Brebes', '2004-02-14', '082313585851', 'febryanvalentyo234@gmail.com', 'L', '2025-11-16 00:00:00', '', '2025-11-16 00:00:00', ''),
('24090126', 'Maulidya Aulia', 'Jl.Dukuhwungu', 'Tegal', '2006-04-06', '0895384224195', 'maulidyaaulia64@gmail.com', 'P', '2025-11-16 00:00:00', 'maulidyaaulia64@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090129', 'Sarah Nur Amalia', 'Adiwerna Kab.Tegal Jawa Tengah', 'Tegal', '2006-06-03', '082313530647', 'sarahnuramaliaa@gmail.com', 'P', '2025-11-16 00:00:00', 'sarahnuramaliaa@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090130', 'Lisza Indana Zulfa', 'Ds. Warureja Kec. Warureja Kab. Tegal', 'Tegal', '2005-10-31', '0895378146118', 'liszaindana11@gmail.com', 'P', '2025-11-16 00:00:00', 'n3k4ther.otr@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090131', 'Muhammad Irhash syahid', 'Kajen - Talang - Kab.Tegal', 'Tegal', '2006-04-22', '081542235634', 'muhammad.irhas108@gmail.com', 'L', '2025-11-16 00:00:00', 'muhammad.irhas108@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090132', 'Muzaqi Nur Arifin', 'Jl. Taman Siswa, Gg. Saditan Indah 4, No.10', 'Kabupaten Brebes', '2005-04-02', '087845770609', 'muzaqi.nurar4@gmail.com', 'L', '2025-11-16 00:00:00', 'muzaqi.nurar4@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090133', 'Muhammad fajar Ramadhan', 'Desa karang Mulya rt05 rw01 kec Suradadi kab Tegal', 'Tegal', '2006-10-15', '081567677073', 'fajartegal355@gmail.com', 'L', '2025-11-16 00:00:00', 'fajartegal355@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090134', 'Moh Fauzi Hasan Bix', 'JL.kh ahmad dahlan RT 05 RW 12 Desa. Pasar Batang Kec. Brebes', 'BREBES', '2003-05-21', '085293738960', 'fauzihasanbix174@gmail.com', 'L', '2025-11-16 00:00:00', 'fauzihasanbix174@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090135', 'Alfian farros alfarisi', 'Jl.anoa, rt 02 rw 04, desa trayeman, kecamatan Slawi, kabupaten tegal', 'Slawi', '2005-11-04', '082137284883', 'alfarisibrata@gmail.com', 'L', '2025-11-16 00:00:00', 'alfarisibrata@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090136', 'julian tri arfandi', 'pagedangan,adiwerna,kab.tegal', 'tegal', '2005-07-28', '088985024204', 'arfand628@gmail.com', 'L', '2025-11-16 00:00:00', 'arfand628@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090137', 'Muhammad Huzaifah Annazif', 'Jl. Perintis kemerdekaan kel slerok kec Tegal Timur', 'Tegal', '2002-10-28', '087846008915', 'hudzaifah2903@gmail.com', 'L', '2025-11-16 00:00:00', 'hudzaifah2903@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090138', 'Rakha Arya Bagaskara', 'Jl. Mliwis Gg. Walet No.9', 'Tegal', '2003-08-05', '085962891782', 'dawgsyogs@gmail.com', 'L', '2025-11-16 00:00:00', 'dawgsyogs@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090139', 'FAUZY ADYTYAMAKI MADHERA', 'JL.Mangga DS.Grobogkulon,Kec.Pangkah,Kab.Tegal Jawa Tengah', 'Ngawi', '2006-07-07', '085931244939', 'fauzyaditya414@gmail.com', 'L', '2025-11-16 00:00:00', 'fauzyaditya414@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('24090141', 'Sofyan Yudha Akmalullah', 'Perumahan Grand Emerald Pengabean, Pengabean, Kec. Dukuhturi, Kab. Tegal, Jawa Tengah', 'Grobogan', '2006-11-05', '085713363903', 'sofyanyudha1@gmail.com', 'L', '2025-11-16 00:00:00', 'sofyanyudha1@gmail.com', '2025-11-16 00:00:00', 'TAMU'),
('25092001', 'Sulthan Khansa', 'Jl. Brawijaya no. 64 Muarareja', 'Tegal', '2002-04-11', '087840321058', 'sulthankhansa11@gmail.com', 'L', '2025-11-16 00:00:00', 'sulthankhansa11@gmail.com', '2025-11-16 00:00:00', 'TAMU');

-- --------------------------------------------------------

--
-- Table structure for table `genders`
--

CREATE TABLE `genders` (
  `GENDER_ID` char(1) NOT NULL,
  `GENDER` char(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `genders`
--

INSERT INTO `genders` (`GENDER_ID`, `GENDER`) VALUES
('L', 'Laki-laki'),
('P', 'Perempuan');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `ORDER_ID` int NOT NULL,
  `ORDER_DATE` datetime NOT NULL,
  `CUST_ID` char(8) DEFAULT '-NoName-',
  `USER_ID` char(8) NOT NULL,
  `TOTAL` decimal(10,2) NOT NULL,
  `METHOD_ID` char(1) DEFAULT '1',
  `BANK_TRANS` varchar(25) DEFAULT NULL,
  `RECEIPT_NUMBER` char(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_details`
--

CREATE TABLE `order_details` (
  `QTY` int NOT NULL DEFAULT '1',
  `PRICE` decimal(10,2) NOT NULL,
  `ORDER_ID` int NOT NULL,
  `PRODUCT_ID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `METHOD_ID` char(1) NOT NULL,
  `METHOD` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`METHOD_ID`, `METHOD`) VALUES
('1', 'Tunai'),
('2', 'Transfer'),
('3', 'QRIS');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `PRODUCT_ID` int NOT NULL,
  `PRODUCT_NAME` varchar(40) NOT NULL,
  `PRICE` decimal(10,2) NOT NULL,
  `CATEGORY_ID` char(2) NOT NULL,
  `CREATED_AT` datetime NOT NULL,
  `CREATED_BY` varchar(40) NOT NULL,
  `UPDATED_AT` datetime NOT NULL,
  `UPDATED_BY` varchar(40) NOT NULL,
  `STOCK` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`PRODUCT_ID`, `PRODUCT_NAME`, `PRICE`, `CATEGORY_ID`, `CREATED_AT`, `CREATED_BY`, `UPDATED_AT`, `UPDATED_BY`, `STOCK`) VALUES
(1, 'Kopi Susu Tetangga 1L', '120000.00', 'KP', '2025-10-31 00:00:00', '', '2025-11-16 00:00:00', '', 97),
(2, 'Kopi Susu Tetangga 500ml', '60000.00', 'KP', '2025-10-31 00:00:00', '', '2025-11-16 00:00:00', '', 91),
(3, 'Kopi Hitam Tetangga 1L', '120000.00', 'KP', '2025-10-31 00:00:00', '', '2025-11-16 00:00:00', '', 100),
(4, 'Teh Remon 1L', '120000.00', 'TC', '2025-10-31 00:00:00', '', '2025-11-16 00:00:00', '', 60),
(5, 'Cokelat 1L', '120000.00', 'TC', '2025-10-31 00:00:00', '', '2025-11-16 00:00:00', '', 100),
(6, 'Kelapa Jeruk', '120000.00', 'TC', '2025-10-31 00:00:00', '', '2025-11-16 00:00:00', '', 87);

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
  `CATEGORY_ID` char(2) NOT NULL,
  `CATEGORY` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `product_categories`
--

INSERT INTO `product_categories` (`CATEGORY_ID`, `CATEGORY`) VALUES
('KP', 'KOPI'),
('TC', 'TUKOCUR');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cashiers`
--
ALTER TABLE `cashiers`
  ADD PRIMARY KEY (`USER_ID`),
  ADD UNIQUE KEY `EML_UN` (`EMAIL`),
  ADD UNIQUE KEY `CN_UN` (`CONTACT_NUMBER`),
  ADD KEY `GENDER_FK` (`GENDER_ID`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`CUST_ID`),
  ADD UNIQUE KEY `CONTACT_NUMBER_UN` (`CONTACT_NUMBER`),
  ADD UNIQUE KEY `EMAIL_C_UN` (`EMAIL`),
  ADD KEY `GENDER_ID_FK` (`GENDER_ID`);

--
-- Indexes for table `genders`
--
ALTER TABLE `genders`
  ADD PRIMARY KEY (`GENDER_ID`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`ORDER_ID`),
  ADD UNIQUE KEY `RECEIPT_NUMBER_UN` (`RECEIPT_NUMBER`),
  ADD KEY `CUST_ID_FK` (`CUST_ID`),
  ADD KEY `METHOD_ID_FK` (`METHOD_ID`),
  ADD KEY `USER_ID_FK` (`USER_ID`);

--
-- Indexes for table `order_details`
--
ALTER TABLE `order_details`
  ADD KEY `ORDER_ID_FK` (`ORDER_ID`),
  ADD KEY `PRODUCT_ID_FK` (`PRODUCT_ID`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`METHOD_ID`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`PRODUCT_ID`),
  ADD UNIQUE KEY `PRODUCT_NAME_UN` (`PRODUCT_NAME`),
  ADD KEY `CATEGORY_ID_FK` (`CATEGORY_ID`);

--
-- Indexes for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`CATEGORY_ID`),
  ADD UNIQUE KEY `CATEGORY_UN` (`CATEGORY`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `ORDER_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2265;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `PRODUCT_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2844;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cashiers`
--
ALTER TABLE `cashiers`
  ADD CONSTRAINT `GENDER_FK` FOREIGN KEY (`GENDER_ID`) REFERENCES `genders` (`GENDER_ID`);

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `GENDER_ID_FK` FOREIGN KEY (`GENDER_ID`) REFERENCES `genders` (`GENDER_ID`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `CUST_ID_FK` FOREIGN KEY (`CUST_ID`) REFERENCES `customers` (`CUST_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `METHOD_ID_FK` FOREIGN KEY (`METHOD_ID`) REFERENCES `payment_methods` (`METHOD_ID`),
  ADD CONSTRAINT `USER_ID_FK` FOREIGN KEY (`USER_ID`) REFERENCES `cashiers` (`USER_ID`);

--
-- Constraints for table `order_details`
--
ALTER TABLE `order_details`
  ADD CONSTRAINT `ORDER_ID_FK` FOREIGN KEY (`ORDER_ID`) REFERENCES `orders` (`ORDER_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `PRODUCT_ID_FK` FOREIGN KEY (`PRODUCT_ID`) REFERENCES `products` (`PRODUCT_ID`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `CATEGORY_ID_FK` FOREIGN KEY (`CATEGORY_ID`) REFERENCES `product_categories` (`CATEGORY_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
