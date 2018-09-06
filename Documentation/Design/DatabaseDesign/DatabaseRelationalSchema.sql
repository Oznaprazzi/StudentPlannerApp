CREATE TABLE Users(
	UserId SERIAL PRIMARY KEY NOT NULL,
	Username varchar(255) UNIQUE NOT NULL,
	Name varchar(255) NOT NULL,
	Password varchar(255) NOT NULL
);

CREATE TABLE Lecturers(
	LecturerId SERIAL PRIMARY KEY NOT NULL,
	UserId int NOT NULL references Users(UserId) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Students(
	StudentId int PRIMARY KEY NOT NULL,
	UserId int NOT NULL references Users(UserId) ON UPDATE CASCADE ON DELETE CASCADE,
	Points int NOT NULL DEFAULT 0,
	Ticked boolean NOT NULL DEFAULT false
);

CREATE TABLE Courses(
	CourseId SERIAL PRIMARY KEY NOT NULL,
	CourseCode char(7) NOT NULL,
	Ticked boolean NOT NULL DEFAULT false
);

CREATE TABLE Assessments(
	AssessmentId SERIAL PRIMARY KEY NOT NULL,
	CourseId int NOT NULL references Courses(CourseId) ON UPDATE CASCADE ON DELETE CASCADE,
	AssessmentType varchar(50) NOT NULL,
	StartDate date NOT NULL,
	DueDate date NOT NULL CHECK(DueDate >= StartDate),
	Title varchar(255) NOT NULL,
	Details text NOT NULL
);

CREATE TABLE Tasks(
	TaskId SERIAL PRIMARY KEY NOT NULL,
	AssessmentId int NOT NULL references Assessments(AssessmentId) ON UPDATE CASCADE ON DELETE CASCADE,
	Description varchar(100) NOT NULL,
	Points int NOT NULL DEFAULT 2
);

CREATE TABLE EnrolledIn (
	StudentId int NOT NULL references Students(StudentId) ON UPDATE CASCADE ON DELETE CASCADE,
	CourseId int NOT NULL references Courses(CourseId) ON UPDATE CASCADE ON DELETE CASCADE,
	PRIMARY KEY(StudentId, CourseId)
);

CREATE TABLE TaughtBy (
	LecturerId int NOT NULL references Lecturers(LecturerId) ON UPDATE CASCADE ON DELETE CASCADE,
	CourseId int NOT NULL references Courses(CourseId) ON UPDATE CASCADE ON DELETE CASCADE,
	PRIMARY KEY(LecturerId, CourseId)
);

CREATE TABLE CompletesAssessment (
	StudentId int NOT NULL references Students(StudentId) ON UPDATE CASCADE ON DELETE CASCADE,
	AssessmentId int NOT NULL references Assessments(AssessmentId) ON UPDATE CASCADE ON DELETE CASCADE,
	Completed boolean NOT NULL DEFAULT false,
	PRIMARY KEY(StudentId, AssessmentId)
);

CREATE TABLE CompletesTask (
	StudentId int NOT NULL references Students(StudentId) ON UPDATE CASCADE ON DELETE CASCADE,
	TaskId int NOT NULL references Tasks(TaskId) ON UPDATE CASCADE ON DELETE CASCADE,
	Completed boolean NOT NULL DEFAULT false,
	PRIMARY KEY(StudentId, TaskId)
);

/*Create Admin Login*/
insert into users(username, name, password) values('admin', 'admin', 'password');