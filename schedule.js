const readlineSync = require('readline-sync');
const clear = require('clear');

function arrangeTeachers(teachers, classes) {
    const assignedTeachers = new Map();

    classes.forEach((classItem) => {
        const suitableTeacher = findSuitableTeacher(teachers, classItem);

        if (suitableTeacher) {
            assignedTeachers.set(classItem, suitableTeacher.name);

            suitableTeacher.givenTime.delete(classItem.time);
        }
    });

    return assignedTeachers;
}

function findSuitableTeacher(teachers, classItem) {
    for (const teacher of teachers) {
        if (teacher.levels.includes(classItem.level) && teacher.givenTime.has(classItem.time)) {
            return teacher;
        }
    }

    return null;
}


function getInput(prompt) {
    return readlineSync.question(prompt);
}

// Example usage:
const levels = ['K1', 'K2', 'K3', 'J1', 'J2', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
const times = ['SEG1', 'SEG2', 'SEG3', 'TER1', 'TER2', 'TER3'];
let teachers = [];
let classes = [];
// CADASTRO DE AULAS
while(readlineSync.keyInYNStrict('Deseja cadastrar uma turma? (Y ou N) ')) {
    clear();
    console.log('Turmas cadastradas', classes);
    let tempClass = new Map();

    let selectedIndex
    selectedIndex = readlineSync.keyInSelect(levels, 'Quais níveis da turma? ') 
    tempClass.set('level', levels[selectedIndex])

    selectedIndex = readlineSync.keyInSelect(times, 'Qual horário da turma? ')
    tempClass.set('time', times[selectedIndex])
    classes.push(tempClass)
    


}
// CADASTRO DE TEACHERS
while(readlineSync.keyInYNStrict('Deseja cadastrar um professor? (Y ou N) ')) {
    clear();
    let tempTeacher = new Map();
    const nome = getInput('Qual o nome do professor? ');
    tempTeacher.set('teacher', nome);

    let selectedIndex
    let teacherLevel = [];
    while ((selectedIndex = readlineSync.keyInSelect(levels, 'Quais níveis '+ nome +' atende? ')) !== -1) {
        teacherLevel.push(levels[selectedIndex]);
        clear();
        console.log('Níveis selecionados: ', teacherLevel)
    }
    tempTeacher.set('levels', teacherLevel);

    let teacherSchedule = new Map();
    while ((selectedIndex = readlineSync.keyInSelect(times, 'Quais horários '+ nome +' tem disponível? ')) !== -1) {
        teacherSchedule.set(times[selectedIndex], true);
        clear();
        console.log('Horários selecionados: ', teacherSchedule)
    }
    tempTeacher.set('givenTime', teacherSchedule)
    console.log('Professor cadastrado', tempTeacher);
    teachers.push(tempTeacher)

}
const assignedTeachers = arrangeTeachers(teachers, classes);

console.log('\nAssigned Teachers:');

assignedTeachers.forEach((teacher, classItem) => {
    console.log(`${classItem.level} class at ${classItem.time} assigned to Teacher with levels ${teacher.levels.join(', ')} and available at times ${teacher.givenTime.join(', ')}`);
});
