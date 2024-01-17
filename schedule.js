const readlineSync = require('readline-sync');
const fs = require('fs');
const clear = require('clear');

function arrangeTeachers(teachers, classes) {
    const placements = [];

    classes.forEach((classItem) => {
        const suitableTeacher = findSuitableTeacher(teachers, classItem);

        if (suitableTeacher) {
            
            const teacherIndex = teachers.indexOf(suitableTeacher);
            if (teacherIndex > -1) teachers[teacherIndex].get('givenTime').set(classItem.get('time'), 'on class');
            
            placements.push({
                class: classItem.get('time') + ' - ' + classItem.get('level'),
                teacher: suitableTeacher.get('teacher')
            })
        } else {
            placements.push({
                class: classItem.get('time') + ' - ' + classItem.get('level'),
                teacher: 'SEM TEACHER DISPONÍVEL'
            })
        }
    });

    return placements;
}

function findSuitableTeacher(teachers, classItem) {
    for (const teacher of teachers) {
        const teacherLevels = teacher.get('levels')
        if (teacherLevels.includes(classItem.get('level')) 
            && teacher.get('givenTime').has(classItem.get('time'))
            && teacher.get('givenTime').get(classItem.get('time')) === 'true' ) {

            return teacher;
        }
    }

    return null;
}

function getInput(prompt) {
    return readlineSync.question(prompt);
}

function convertClassesToJSON(classes) {
    if (classes.length > 0) {
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
    if (teachers.length > 0) {
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

function saveToJSON(json, option) {
    if ( option === 'classes') fs.writeFileSync('classes.json', json);
    if ( option === 'teachers') fs.writeFileSync('teachers.json', json);
}

// Example usage:
const levels = ['K1', 'K1A', 'K2', 'K2A', 'J0', 'J1', 'J2', 'T1', 'TA', 'T2', 'T3', 'T4', 'T5', 'T6'];
const times = ['SEG1', 'SEG2', 'SEG3', 'TER1', 'TER2', 'TER3', 'SEX1', 'SEX2', 'SEX3'];
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
    selectedIndex = readlineSync.keyInSelect(times, 'Qual horário da turma? ')
    tempClass.set('time', times[selectedIndex])

    selectedIndex = readlineSync.keyInSelect(levels, 'Qual o níveil da turma? ') 
    tempClass.set('level', levels[selectedIndex])

    classes.push(tempClass)
}
    convertClassesToJSON(classes);
    clear();
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
        teacherSchedule.set(times[selectedIndex], 'true');
        clear();
        console.log('Horários selecionados: ', teacherSchedule)
    }

    tempTeacher.set('givenTime', teacherSchedule)
    console.log('Professor cadastrado', tempTeacher);
    teachers.push(tempTeacher)
}

    for (const teacher of teachers) {
        for (const time of times) {
            if (!teacher.get('givenTime').has(time)) teacher.get('givenTime').set(time, 'false');
        }
        const sortedGivenTimeEntries = [...teacher.get('givenTime').entries()].sort((a, b) => a[0].localeCompare(b[0]));
        teacher.set('givenTime', new Map(sortedGivenTimeEntries))
    }

    convertTeachersToJSON(teachers);
    classes.sort((a, b) => {
        if (b.get('time') > a.get('time')) return -1;
        if (b.get('time') < a.get('time')) return 1;
        if (b.get('time') === a.get('time')) return 0;
    });

    const finalPlacements = arrangeTeachers(teachers, classes);

console.log('\nPlacements:', finalPlacements);
console.log('\nTeachers:', teachers);
console.log('\nClasses:', classes);

if (readlineSync.keyInYNStrict('Deseja salvar o placement como csv? (Y ou N) ')) {
    const replacer = (key, value) => value === null ? '' : value 
    const header = Object.keys(finalPlacements[0])
    const csv = [
    header.join(','), // header row first
    ...finalPlacements.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n')

    fs.writeFileSync('placements.csv', csv);

    let finalTeachers = [];
    for (const teacher of teachers) {
        finalTeachers.push({
            "teacher": teacher.get('teacher'),
            "horarios": Object.fromEntries(teacher.get('givenTime'))
        })
    }

    const headerTeachers  = Object.keys(finalTeachers[0])
    const csvTeachers  = [
    header.join(','), // header row first
    ...finalTeachers.map(row => headerTeachers.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n')

    fs.writeFileSync('teachers.csv', csvTeachers );

}
