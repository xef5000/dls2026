import React, { useState, useEffect } from 'react';
import './App.css';

// --- Reusable ProgressBar Component ---
const ProgressBar = ({ percentage }) => (
    <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
    </div>
);

// --- Main App Component ---
function App() {
    const [stats, setStats] = useState({
        careerPercentage: 0,
        semesterPercentage: 0,
        daysLeft: 0,
        currentSemesterName: 'Semester',
    });

    useEffect(() => {
        // --- CONFIGURATION ---
        const schoolYear = {
            // Updated dates based on your input
            startDate: new Date('2025-08-26T00:00:00'),
            endDate: new Date('2026-06-19T23:59:59'),
            // Note: You may need to adjust holidays/PA days for the new schedule
            holidays: [
                { start: new Date('2025-12-22T00:00:00'), end: new Date('2026-01-02T23:59:59') },
                { start: new Date('2026-03-16T00:00:00'), end: new Date('2026-03-20T23:59:59') }
            ],
            paDays: [
                new Date('2025-10-10T00:00:00'), new Date('2025-11-28T00:00:00'),
                new Date('2026-01-30T00:00:00'), new Date('2026-04-24T00:00:00'),
                new Date('2026-06-05T00:00:00')
            ],
            statutoryHolidays: [
                new Date('2025-09-01T00:00:00'), new Date('2025-10-13T00:00:00'),
                new Date('2026-02-16T00:00:00'), new Date('2026-04-03T00:00:00'),
                new Date('2026-04-06T00:00:00'), new Date('2026-05-18T00:00:00')
            ]
        };

        const semester1 = {
            name: 'Semester 1',
            startDate: new Date('2025-08-26T00:00:00'),
            endDate: new Date('2026-01-23T23:59:59')
        };

        const semester2 = {
            name: 'Semester 2',
            startDate: new Date('2026-01-26T00:00:00'),
            endDate: new Date('2026-06-19T23:59:59')
        };

        const GRADES = 13; // K-12

        // --- UTILITY FUNCTIONS (no changes here) ---
        const isSchoolDay = (date, yearInfo) => {
            const day = date.getDay();
            if (day === 0 || day === 6) return false;

            const dateString = date.toISOString().split('T')[0];
            if (yearInfo.paDays.some(d => d.toISOString().split('T')[0] === dateString)) return false;
            if (yearInfo.statutoryHolidays.some(d => d.toISOString().split('T')[0] === dateString)) return false;

            for (const holiday of yearInfo.holidays) {
                if (date >= holiday.start && date <= holiday.end) return false;
            }

            return true;
        };

        const getSchoolDays = (start, end, yearInfo) => {
            let count = 0;
            let currentDate = new Date(start);
            while (currentDate <= end) {
                if (isSchoolDay(currentDate, yearInfo)) {
                    count++;
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return count;
        };

        // --- CALCULATIONS ---
        const calculateStats = () => {
            const now = new Date();

            // --- Career and Days Left Calculations (updated with new school year dates) ---
            const totalSchoolDaysInYear = getSchoolDays(schoolYear.startDate, schoolYear.endDate, schoolYear);
            const totalSchoolDaysK12 = totalSchoolDaysInYear * GRADES;
            const schoolDaysCompletedK11 = totalSchoolDaysInYear * 12;
            const schoolDaysCompletedThisYear = getSchoolDays(schoolYear.startDate, now, schoolYear);
            const totalSchoolDaysCompleted = schoolDaysCompletedK11 + schoolDaysCompletedThisYear;
            const careerPercentage = (totalSchoolDaysCompleted / totalSchoolDaysK12) * 100;
            const daysLeft = totalSchoolDaysInYear - schoolDaysCompletedThisYear;

            // --- Semester Calculation Logic ---
            let currentSemester;
            if (now >= semester1.startDate && now <= semester1.endDate) {
                currentSemester = semester1;
            } else if (now >= semester2.startDate && now <= semester2.endDate) {
                currentSemester = semester2;
            } else {
                // Default case (e.g., summer break or between semesters)
                // Shows the next upcoming semester or the last completed one.
                currentSemester = now < semester1.startDate ? semester1 : semester2;
            }

            const totalSemesterDays = getSchoolDays(currentSemester.startDate, currentSemester.endDate, schoolYear);
            const semesterDaysCompleted = getSchoolDays(currentSemester.startDate, now, schoolYear);
            let semesterPercentage = 0;
            if (totalSemesterDays > 0) {
                semesterPercentage = (semesterDaysCompleted / totalSemesterDays) * 100;
            }


            setStats({
                careerPercentage: careerPercentage.toFixed(2),
                semesterPercentage: semesterPercentage.toFixed(2),
                daysLeft: daysLeft > 0 ? daysLeft : 0,
                currentSemesterName: currentSemester.name,
            });
        };

        calculateStats();
        const interval = setInterval(calculateStats, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container">
            <header>
                <h1>Time Left Until School Is Over</h1>
                <p>Grade 12 - Ottawa, ON</p>
            </header>
            <main>
                <div className="card">
                    <h2>School Career Progress</h2>
                    <ProgressBar percentage={stats.careerPercentage} />
                    <p className="percentage-text">{stats.careerPercentage}%</p>
                </div>
                <div className="card">
                    <h2>{stats.currentSemesterName} Progress</h2>
                    <ProgressBar percentage={stats.semesterPercentage} />
                    <p className="percentage-text">{stats.semesterPercentage}%</p>
                </div>
                <div className="card">
                    <h2>Days of School Left</h2>
                    <p className="large-text">{stats.daysLeft}</p>
                </div>
            </main>
        </div>
    );
}

export default App;