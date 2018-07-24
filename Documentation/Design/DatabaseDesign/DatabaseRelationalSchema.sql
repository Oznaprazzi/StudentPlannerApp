CREATE TYPE atype AS ENUM ('Assignment', 'Test', 'Exam', 'Other');

CREATE TABLE Users(
	Username varchar(255) PRIMARY KEY NOT NULL,
	Name varchar(255) NOT NULL,
	Password varchar(255) NOT NULL
);

CREATE TABLE Lecturer(
	LecturerId SERIAL PRIMARY KEY NOT NULL,
	Username varchar(255) NOT NULL references Users(Username) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Student(
	StudentId int PRIMARY KEY NOT NULL,
	Username varchar(255) NOT NULL references Users(Username) ON UPDATE CASCADE ON DELETE CASCADE,
	Points int NOT NULL DEFAULT 0
);

CREATE TABLE Course(
	CourseId SERIAL PRIMARY KEY NOT NULL,
	CourseCode char(7) NOT NULL
);

CREATE TABLE Assessment(
	AssessmentId SERIAL PRIMARY KEY NOT NULL,
	CourseId int NOT NULL references Course(CourseId) ON UPDATE CASCADE ON DELETE CASCADE,
	AssessmentType atype NOT NULL,
	StartDate date NOT NULL,
	DueDate date NOT NULL CHECK(DueDate >= current_date),
	Title varchar(255) NOT NULL,
	Details text NOT NULL
);

CREATE TABLE Task(
	TaskId SERIAL PRIMARY KEY NOT NULL,
	AssessmentId int NOT NULL references Assessment(AssessmentId) ON UPDATE CASCADE ON DELETE CASCADE,
	Name varchar(255) NOT NULL,
	Points int NOT NULL DEFAULT 2,
	Description text NOT NULL	
);

CREATE TABLE EnrolledIn (
	StudentId int NOT NULL references Student(StudentId) ON UPDATE CASCADE ON DELETE CASCADE,
	CourseId int NOT NULL references Course(CourseId) ON UPDATE CASCADE ON DELETE CASCADE,
	PRIMARY KEY(StudentId, CourseId)
);

CREATE TABLE TaughtBy (
	LecturerId int NOT NULL references Lecturer(LecturerId) ON UPDATE CASCADE ON DELETE CASCADE,
	CourseId int NOT NULL references Course(CourseId) ON UPDATE CASCADE ON DELETE CASCADE,
	PRIMARY KEY(LecturerId, CourseId)
);

CREATE TABLE CompletesAsessment (
	StudentId int NOT NULL references Student(StudentId) ON UPDATE CASCADE ON DELETE CASCADE,
	AssessmentId int NOT NULL references Assessment(AssessmentId) ON UPDATE CASCADE ON DELETE CASCADE,
	Completed boolean NOT NULL DEFAULT false,
	PRIMARY KEY(StudentId, AssessmentId)
);

CREATE TABLE CompletesTask (
	StudentId int NOT NULL references Student(StudentId) ON UPDATE CASCADE ON DELETE CASCADE,
	TaskId int NOT NULL references Task(TaskId) ON UPDATE CASCADE ON DELETE CASCADE,
	Completed boolean NOT NULL DEFAULT false,
	PRIMARY KEY(StudentId, TaskId)
);