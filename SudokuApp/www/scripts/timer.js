class Timer {
    constructor(elementID) {
        this.elementID = elementID;
        this.time = 0;
        this.timer = null;
    }

    run() {
        var obj = this;
        var previousTime = new Date().getTime();
        this.timer = setInterval(function () {
            var currentTime = new Date().getTime();
            var elapsedTime = currentTime - previousTime;

            obj.updateTime(elapsedTime);

            previousTime = currentTime;
        }, 250);
    }

    resume(t) {
        var obj = this;
        var previousTime = new Date().getTime() - t;
        this.timer = setInterval(function () {
            var currentTime = new Date().getTime();
            var elapsedTime = currentTime - previousTime;

            obj.updateTime(elapsedTime);

            previousTime = currentTime;
        }, 250);
    }

    updateTime(elapsedTime) {
        var interval = elapsedTime / 1000;
        this.time += interval;

        document.getElementById(this.elementID).innerHTML = this.getTime();
    }

    getTime() {
        var seconds = Math.floor(this.time % 60);
        var minutes = Math.floor(this.time % (60 * 60) / 60);
        var hours = Math.floor(this.time / (60 * 60));

        var clockDisplay = "";
        if (hours > 0)
            clockDisplay = this.formatNumber(hours) + ":" + this.formatNumber(minutes) + ":" + this.formatNumber(seconds);
        else
            clockDisplay = this.formatNumber(minutes) + ":" + this.formatNumber(seconds);

        return clockDisplay;
    }

    getTimeMillis(t) {
        var tArray = t.split(":");
        for (var i = 0; i < tArray.length; i++) {
            console.log("Index " + i + ": " + tArray[i]);
        }

        var hours = 0;
        var minutes = 0;
        var seconds = 0;

        if (tArray.length === 3) {
            hours = parseInt(tArray[0]) * 60 * 60;
            minutes = parseInt(tArray[1]) * 60;
            seconds = parseInt(tArray[2]);
        }
        else {
            minutes = parseInt(tArray[0]) * 60;
            seconds = parseInt(tArray[1]);
        }

        return (hours + minutes + seconds) * 1000;
    }

    formatNumber(num) {
        if (num < 10)
            return "0" + num;
        return "" + num;        
    }

    stopTimer() {
        clearInterval(this.timer);
    }
}