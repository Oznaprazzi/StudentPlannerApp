CREATE TYPE atype AS ENUM ('Assignment', 'Test', 'Exam', 'Other');

CREATE TABLE Users(
	UserId SERIAL PRIMARY KEY NOT NULL,
	Username varchar(255) NOT NULL UNIQUE,
	Name varchar(255) NOT NULL,
	Password varchar(255) NOT NULL
);

CREATE TABLE Lecturer(
	LecturerId SERIAL PRIMARY KEY NOT NULL,
	UserId int NOT NULL references Users(UserId) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE Student(
	StudentId SERIAL PRIMARY KEY NOT NULL,
	UserId int NOT NULL references Users(UserId) ON UPDATE CASCADE ON DELETE RESTRICT,
	Points int NOT NULL DEFAULT 0
);

CREATE TABLE Course(
	CourseId SERIAL PRIMARY KEY NOT NULL,
	CourseCode char(7) NOT NULL
);

CREATE TABLE Assessment(
	AssessmentId SERIAL PRIMARY KEY NOT NULL,
	CourseId int NOT NULL references Course(CourseId) ON UPDATE CASCADE ON DELETE RESTRICT,
	AssessmentType atype NOT NULL,
	DueDate date NOT NULL CHECK(DueDate >= current_date),
	Title varchar(255) NOT NULL,
	Details text NOT NULL
);

CREATE TABLE Task(
	TaskId SERIAL PRIMARY KEY NOT NULL,
	AssessmentId int NOT NULL references Assessment(AssessmentId) ON UPDATE CASCADE ON DELETE RESTRICT,
	Name varchar(255) NOT NULL,
	Points int NOT NULL DEFAULT 2,
	Description text NOT NULL	
);

CREATE TABLE EnrolledIn (
	StudentId int NOT NULL references Student(StudentId) ON UPDATE CASCADE ON DELETE RESTRICT,
	CourseId int NOT NULL references Course(CourseId) ON UPDATE CASCADE ON DELETE RESTRICT,
	PRIMARY KEY(StudentId, CourseId)
);

CREATE TABLE TaughtBy (
	LecturerId int NOT NULL references Lecturer(LecturerId) ON UPDATE CASCADE ON DELETE RESTRICT,
	CourseId int NOT NULL references Course(CourseId) ON UPDATE CASCADE ON DELETE RESTRICT,
	PRIMARY KEY(LecturerId, CourseId)
);

CREATE TABLE CompletesAsessment (
	StudentId int NOT NULL references Student(StudentId) ON UPDATE CASCADE ON DELETE RESTRICT,
	AssessmentId int NOT NULL references Assessment(AssessmentId) ON UPDATE CASCADE ON DELETE RESTRICT,
	Completed boolean NOT NULL DEFAULT false,
	PRIMARY KEY(StudentId, AssessmentId)
);

CREATE TABLE CompletesTask (
	StudentId int NOT NULL references Student(StudentId) ON UPDATE CASCADE ON DELETE RESTRICT,
	TaskId int NOT NULL references Task(TaskId) ON UPDATE CASCADE ON DELETE RESTRICT,
	Completed boolean NOT NULL DEFAULT false,
	PRIMARY KEY(StudentId, TaskId)
);