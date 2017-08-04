/**
 * Implementation of a simple note playing game
 */
(function(){
    let expectedNote = null;

    function newTask() {
        expectedNote = tunes.chooseRandomNote();
        document.querySelector("#taskNote").innerHTML = expectedNote.name() + expectedNote.accidental();
    }

    tunes.assignNoteChangedHandler(note => {
       if (note.name() === expectedNote.name()){
           newTask();
       }
    });

    newTask();
})();