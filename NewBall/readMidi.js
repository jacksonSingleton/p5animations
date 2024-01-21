
let fs = require('fs')
let midi = require('midi-parser-js')
const { Midi } = require('tonal')


let freqs = []
let notes = []
let shifts = []


console.log(process.argv)

const filename = process.argv[2]

function readNotes(filename) {
    fs.readFile(filename, 'base64', function(err, data) {
    let midiArray = midi.parse(data)
    midiArray.track[1].event.forEach((note, idx) => {
        if(note.data){
            if(note.data[1] == 0) return
            idx === 0 ? shifts.push(0) : shifts.push(note.data[0] - midiArray.track[1].event[idx-1].data[0])
            notes.push(Midi.midiToNoteName(note.data[0], { sharps: true }))
            let data = Midi.midiToFreq(note.data[0])
            freqs.push(data)
        }
    })
    console.log(notes)

    fs.writeFile('shifts.json', JSON.stringify(shifts.filter(Number)), function (err) {
        if (err) throw err;
        console.log('Saved shifts!');
      }
    );
    fs.writeFile('midi_notes.json', JSON.stringify(notes.filter((e) => e.length)), function (err) {
        if (err) throw err;
        console.log('Saved notes!');
      }
    );
    fs.writeFile('frequencies.json', JSON.stringify(freqs.filter(Number)), function (err) {
        if (err) throw err;
        console.log('Saved frequencies!');
      }
    );
})
}


readNotes(filename)