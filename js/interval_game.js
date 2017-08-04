/**
 * Implementation of a simple note playing game
 */
(function(){
    let expectedNote = tunes.chooseRandomNote();

    function newTask() {
        let oldNote = expectedNote;
        let interval = tunes.chooseRandomInterval();
        expectedNote = interval.incrementNote(oldNote);
        console.info("Expect " + expectedNote.name2());
        document.querySelector("#taskNote").innerHTML = oldNote.name2();
        document.querySelector("#taskInterval").innerHTML = interval.name();
    }

    tunes.assignNoteChangedHandler(note => {
       if (note.name() === expectedNote.name()){
           newTask();
       }
    });

    newTask();
})();