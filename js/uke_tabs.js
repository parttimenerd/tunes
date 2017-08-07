(function(){
    function updateChordDisplay(){
        let html = "";
        try {
            const chord = teoria.chord(document.getElementById("chordInput").value);
            html = tunes.generateTabsForChord(chord, tunes.tuningFromString("ukulele"));
        } catch (e){
            console.error(e);
            html = "wrong input format";
        }
        document.getElementById("tabs").innerHTML = html;
    }

    document.getElementById("chordInput").onkeyup = updateChordDisplay;
    updateChordDisplay();
})();