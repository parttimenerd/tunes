/* Inspired by https://github.com/eric-wood/guitar-tuner/blob/master/tuner.js */
(function() {
    const CENTS_THRESHOLD = 15;
    let freqs;

    function initStream(stream) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        const context = new AudioContext();
        const analyser = context.createAnalyser();
        const sampleRate = 2 ** 14;
        analyser.fftSize = sampleRate;

        const source = context.createMediaStreamSource(stream);
        source.connect(analyser);
        freqs = new Freqs(analyser, sampleRate, source, context);
    }

    function initAudio() {
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        navigator.getUserMedia({audio: true}, initStream, function (e) {
            alert('Hey, you should click "allow" so I can listen to you!');
            console.log(e);
        });
    }

    /**
     * Encapsulates all the work with the raw fourier transformation data
     */
    class Freqs {
        constructor(analyzer, sampleRate, source, context){
            this.rawFreqData = new Uint8Array(analyzer.frequencyBinCount);
            this.analyzer = analyzer;
            this.freqs = new Map(); // {freq: amplitude}
            this.sampleRate = sampleRate;
            this.source = source;
            this.context = context;
            this.thresholdFactor = 0.95; // maxFreq * threshold is the minimal frequency that is considered
            this.maxAmplitude = 0;
        }

        update(){
            this.analyzer.getByteFrequencyData(this.rawFreqData);
            for (let i = 0; i < this.rawFreqData.length; i++){
                this.freqs.set(this._rawFreqToFreq(i), this.rawFreqData[i]);
            }
            this.maxAmplitude = Math.max(...this.rawFreqData);
        }

        _rawFreqToFreq(rawFreq){
            const step = this.context.sampleRate / this.sampleRate;
            return Math.round(rawFreq * step);
        }

        /**
         * Returns the frequencies above the threshold
         */
        freqsAboveThreshold(){
            const threshold = this.thresholdFactor * this.maxAmplitude;
            let ret = [];
            this.freqs.forEach((amp, f, map) => {
                if (amp >= threshold){
                    ret.push(f);
                }
            });
            return ret;
        }

        /**
         * Get the currently listened to note and cents…
         * @return [Note|int]
         */
        calculateNote(){
            const freqs = this.freqsAboveThreshold();
            const notes = freqs.map((f) => teoria.note.fromFrequency(f));
            notes.sort((e) => Math.abs(e.cents));
            return [notes[0].note, notes[0].cents];
        }
    }

    function countInArray(array, elemToCount){
        return array.filter(e => e === elemToCount);
    }

    const LAST_NOTES_TO_KEEP = 4;
    const lastNotes = [];

    let lastRecognizedNote = null;

    let noteChangedHandlers = [];

    function update() {
        freqs.update();
        const [note, cents] = freqs.calculateNote();
        //console.log(note.name(), cents, note.accidental());
        if (Math.abs(cents) < CENTS_THRESHOLD) {
            console.debug(note.name2(), cents)
            lastNotes.push(note);
            if (lastNotes.length > LAST_NOTES_TO_KEEP) {
                lastNotes.shift();
            }
        }
        let lastReqNote = lastRecognizedNote;
        let reqNote = tunes.getNote();
        if (reqNote !== null && (lastReqNote === null || lastReqNote.name() === reqNote.name())){
            noteChangedHandlers.forEach(h => h(reqNote));
        }
    }

    window.tunes = {};

    /**
     * Get the currently played note
     * @return Note
     */
    window.tunes.getNote = function(){
        let note = null;
        for (let i = 0; i < lastNotes.length; i++){
            if (note === null){
                note = lastNotes[i];
            } else if (lastNotes[i].name() !== note.name()){
                return lastRecognizedNote;
            }
        }
        lastRecognizedNote = note;
        return note;
    };

    /**
     * Adds a new function that is called with the note after the current note changed to a new one.
     */
    window.tunes.assignNoteChangedHandler = function(handler){
        noteChangedHandlers.push(handler);
    };

    window.tunes.chooseRandomNote = function(){
        return teoria.note.fromKey(Math.floor(Math.random() * 1000));
    };

    class Interval {
        constructor(baseName, modifier, halftones){
            this.baseName = baseName;
            this.halftones = halftones;
            this.modifier = modifier;
        }

        incrementNote(note){
            return teoria.note.fromKey(note.key() + this.halftones);
        }

        decrementNote(note){
            return teoria.note.fromKey(note.key() - this.halftones);
        }

        name(){
            if (this.modifier !== ""){
                return this.modifier + " " + this.baseName;
            }
            return this.baseName;
        }
    }

    /**
     * Latin like names of all intervals and corresponding half tones
     * @type {Interval[]}
     */
    window.tunes.intervals = [
        new Interval("unison", "perfect", 0),
        new Interval("second", "minor", 1),
        new Interval("second", "major", 2),
        new Interval("third", "minor", 3),
        new Interval("third", "major", 4),
        new Interval("fourth", "perfect", 5),
        new Interval("fifth", "perfect", 7),
        new Interval("sixth", "minor", 8),
        new Interval("sixth", "major", 9),
        new Interval("seventh", "minor", 10),
        new Interval("seventh", "major", 11),
        new Interval("octave", "perfect", 12)
    ];

    /**
     * Returns a random interval
     * @return {Interval}
     */
    window.tunes.chooseRandomInterval = function(){
        return this.intervals[Math.floor(Math.random() * this.intervals.length)]
    };


    initAudio();

    setInterval(update, 200);
})();