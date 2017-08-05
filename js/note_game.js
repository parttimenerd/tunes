/**
 * Implementation of a simple note playing game
 */
(function(){
    let expectedNote = null;

    function newTask() {
        expectedNote = tunes.chooseRandomNote();
        document.querySelector("#task").innerHTML = `Play ${utils.chooseArticle(expectedNote.name2())}
                                                    <span class="note">${expectedNote.name2()}</span>`
    }

    tunes.assignNoteChangedHandler(note => {
       if (note.name() === expectedNote.name()){
           newTask();
       }
    });

    newTask();
})();