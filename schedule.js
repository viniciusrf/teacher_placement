const readlineSync = require('readline-sync');
const fs = require('fs');
const clear = require('clear');

function arrangeTeachers(teachers, classes) {
    const placements = [];

    classes.forEach((classItem) => {
        const suitableTeacher = findSuitableTeacher(teachers, classItem);

        if (suitableTeacher) {
            let placementTemp
            placementTemp.set('class', classItem);
            placementTemp.set('teacher', suitableTeacher.name)
            placements.push(placementTemp)
        }
    });

    return placements;
}

function findSuitableTeacher(teachers, classItem) {
    for (const teacher of teachers) {
        const teacherLevels = teacher.get('levels')
        if (teacherLevels.includes(classItem.level) && teacher.givenTime.has(classItem.time)) {
            suitableTeacher.givenTime.delete(classItem.time);
            return teacher;
        }
    }

    return null;
}

function getInput(prompt) {
    return readlineSync.question(prompt);
}

function convertClassesToJSON(classes) {
    if (classes.lenght > 0) {
        const classesJSON = JSON.stringify(
            classes.map(map => Array.from(map.entries()))
        );
        saveToJSON(classesJSON, 'classes');
    }
    
}

function convertJSONtoClasses(classesJson) {
    const parsedArray = JSON.parse(classesJson);
    return parsedArray.map(entries => new Map(entries));
}

function convertTeachersToJSON(teachers) {
    if (teachers.lenght > 0) {
        const teachersJSON = JSON.stringify(
            teachers.map(map => {
                return {
                    teacher: map.get('teacher'),
                    levels: map.get('levels'),
                    givenTime: Object.fromEntries(map.get('givenTime'))
                };
            })
        );
        saveToJSON(teachersJSON, 'teachers');
    }
}

function convertJSONtoTeachers(teachersJson) {
    const parsedArray = JSON.parse(teachersJson);
    return parsedArray.map(item => {
        return new Map([
            ['teacher', item.teacher],
            ['levels', item.levels],
            ['givenTime', new Map(Object.entries(item.givenTime))]
        ]);
    });
}

function saveToJSON(json, option) {
    if ( option === 'classes') fs.writeFileSync('classes.json', json);
    if ( option === 'teachers') fs.writeFileSync('teachers.json', json);
}

function getFromJSON(option) {
    if ( option === 'classes' && fs.existsSync('./classes.json')) {
        const classesJSON = fs.readFileSync('./classes.json')
        return convertJSONtoClasses(classesJSON);

    }
    if ( option === 'teachers' && fs.existsSync('./teachers.json')) {
        const teachersJSON = fs.readFileSync('./teachers.json')
        return convertJSONtoTeachers(teachersJSON);
    }
}

// Example usage:
const levels = ['K1', 'K2', 'K3', 'J1', 'J2', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
const times = ['SEG1', 'SEG2', 'SEG3', 'TER1', 'TER2', 'TER3'];
let teachers = [];
let classes = [];
//CHECK PARA VER SE EXISTEM ARQUIVOS
classes = getFromJSON('classes');
teachers = getFromJSON('teachers');
// CADASTRO DE AULAS
while(readlineSync.keyInYNStrict('Deseja cadastrar uma turma? (Y ou N) ')) {
    clear();
    console.log('Turmas cadastradas', classes);
    let tempClass = new Map();

    let selectedIndex
    selectedIndex = readlineSync.keyInSelect(levels, 'Qual o níveil da turma? ') 
    tempClass.set('level', levels[selectedIndex])

    selectedIndex = readlineSync.keyInSelect(times, 'Qual horário da turma? ')
    tempClass.set('time', times[selectedIndex])
    classes.push(tempClass)
}
    convertClassesToJSON(classes);

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
    convertTeachersToJSON(teachers);
const assignedTeachers = arrangeTeachers(teachers, classes);

console.log('\nAssigned Teachers:', assignedTeachers);

