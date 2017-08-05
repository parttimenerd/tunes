/**
 * Code to create triad and accord games.
 */
(function(){

    /**
     * "Play several notes one after another" task
     */
    class Task {
        /**
         * Create a new Task object
         * @param {String} template task text with NOTES as a place holder for the notes
         * @param {teoria.Note[]} expectedNotes array of expected notes that should be played one after another
         * @param {String} hint hint for the solution of the exercise
         */
        constructor(template, expectedNotes, hint){
            this.template = template;
            /**
             * @type {Note[]}
             */
            this.expectedNotes = expectedNotes;
            /**
             * Number of right notes that are already stored.
             * @type {number}
             */
            this.numberOfRightNotes = 0;
            this.hint = hint;
        }

        html(){
            const unknownNoteStr = "??";
            const noteSep = "-";
            const strs = [];
            for (let i = 0; i < this.numberOfRightNotes; i++){
                const name = this.expectedNotes[i].name2();
                strs.push(name.length === 2 ? name : (" " + name));
            }
            for (let i = this.numberOfRightNotes; i < this.expectedNotes.length; i++){
                strs.push(unknownNoteStr);
            }
            const text = strs.join(noteSep);
            return this.template.replace("NOTES", `<span class="notes" title="${this.hint}">${text}</span>`)
        }

        /**
         * Check whether the new note is correct, register this if true
         * @param {Note} note new note to check
         * @return {boolean} is the new note correct?
         */
        update(note){
            if (this.finished()){
                return true;
            }
            if (this.expectedNotes[this.numberOfRightNotes].name2() === note.name2()){
                this.numberOfRightNotes += 1;
                return true;
            }
            return false;
        }

        finished(){
            return this.numberOfRightNotes === this.expectedNotes.length;
        }

    }

    /**
     * Base class for multi note games
     */
    class MultiNoteGame {

        /**
         * @param {String} elementId element to display the the task description in
         */
        constructor(elementId){
            this.elementId = elementId;
            this.currentTask = this.createTask();
        }

        /**
         * Creates a new task
         * @return {Task} new task
         */
        createTask(){
            throw "Not implemented";
        }

        updateDisplay(){
            document.getElementById(this.elementId).innerHTML = this.currentTask.html();
        }

        /**
         * Process a new note and update the task if necessary
         * @param {Note} note new note
         */
        update(note){
            if (this.currentTask.update(note)){
                if (this.currentTask.finished()) {
                    this.currentTask = this.createTask();
                }
                this.updateDisplay();
            }
        }

        static _incrementNote(note, halftones){
            return teoria.note.fromKey(note.key() + halftones % 12);
        }
    }

    window.triads = {};
    window.triads.MultiNoteGame = MultiNoteGame;

    window.triads.initGame = function(game, noteDisplayId){
        game.updateDisplay();
        tunes.assignNoteChangedHandler(note => game.update(note));
        tunes.assignNoteChangedHandler(note => {
            const text = `Current note: <span class="note">${note.name2()}</span>`;
            document.getElementById(noteDisplayId).innerHTML = text;
        })
    };

    /**
     * A simple game where the player has to play the 3 notes of a triad.
     */
    class TriadGame extends MultiNoteGame {
        createTask(){
            const majorThird = tunes.getInterval("major third");
            const minorThird = tunes.getInterval("minor third");
            const styles = [
                {
                    name: "diminished",
                    firstInterval: minorThird,
                    secondInterval: minorThird,
                    app: "dim"
                },
                {
                    name: "minor",
                    firstInterval: minorThird,
                    secondInterval: majorThird,
                    app: "m"
                },
                {
                    name: "major",
                    firstInterval: majorThird,
                    secondInterval: minorThird,
                    app: ""
                },
                {
                    name: "augmented",
                    firstInterval: majorThird,
                    secondInterval: majorThird,
                    app: "aug"
                }
            ];

            const style = styles[Math.floor(Math.random() * styles.length)];
            const baseNote = tunes.chooseRandomNote();
            const triadNameParts = [baseNote.name2().toUpperCase(), style.app];
            const formatInterval = i => `${i.name()} (${i.halftones})`;
            const secondNote = MultiNoteGame._incrementNote(baseNote, style.firstInterval.halftones);
            const thirdNote = MultiNoteGame._incrementNote(secondNote, style.secondInterval.halftones);
            const hint = `${utils.chooseArticle(style.name).toUpperCase()} ${style.name} triad`
                            + `consists of a base note followed `
                            + `by a ${formatInterval(style.firstInterval)} and a ${formatInterval(style.secondInterval)}`;
            return new Task(`Play ${utils.chooseArticle(triadNameParts[0])}
                            <span class="note">${triadNameParts.join("")}</span> triad: NOTES`,
                [baseNote, secondNote, thirdNote], hint);

        }
    }

    window.triads.TriadGame = TriadGame;
})();