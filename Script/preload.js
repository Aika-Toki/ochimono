const Images = [
	"Background/246147.jpg",
	"Character/0600.png",
	"Character/0601.png",
	"Character/0602.png",
	"Character/0603.png",
	"Character/0604.png",
	"Character/0605.png",
	"Character/0606.png",
	"Character/0607.png",
	"Character/0608.png",
	"Character/0609.png",
	"Character/0610.png",
	"113652.png",
	"115411.png",
];
const Audios = ["200406.mp3", "963624.mp3"];
const Videos = [];
function preload() {
	Images.forEach((e) => {
		let el = document.createElement("img");
		el.src = "./Assets/Images/" + e;
		console.debug(el);
	});
	Audios.forEach((e) => {
		let el = document.createElement("audio");
		el.src = "./Assets/Sounds/" + e;
		console.debug(el);
		el.load();
	});
	Videos.forEach((e) => {
		let el = document.createElement("video");
		el.src = "./Assets/Videos/" + e;
		console.debug(el);
		el.load();
	});
}
