class RoomDescription {

	constructor(id, size, lewdness, usage, architecture, decor, state, qualities, desc = "") {
		this.id = id;
		this.size = size;
		this.lewdness = lewdness;
		this.usage = usage;
		this.architecture = architecture;
		this.decor = decor;
		this.state = state;
		this.qualities = qualities;
		this.desc = desc;
	}

	static compareTrait(s1, s2) {
		//console.log("Traits compared: " + s1 + ", " + s2);
		if(s1 === "" || s2 === "") {
			return true;
		}
		if(s1.startsWith("not")) {
			return s1.slice(3) !== s2;
		}
		if(s2.startsWith("not")) {
			return s1 !== s2.slice(3);
		}
		return s1 === s2;
	}

	compareSize(d) {
		return RoomDescription.compareTrait(this.size, d.size);
	}

	//Lewdness states: "Subtle", "Overt", "None", "notNone"
	compareLewdness(d) {
		return RoomDescription.compareTrait(this.lewdness, d.lewdness);
	}

	compareUsage(d) {
		return RoomDescription.compareTrait(this.usage, d.usage);
	}

	compareArchitecture(d) {
		return RoomDescription.compareTrait(this.architecture, d.architecture);
	}

	compareDecor(d) {
		return RoomDescription.compareTrait(this.decor, d.decor);
	}

	compareState(d) {
		return RoomDescription.compareTrait(this.state, d.state);
	}

	compareQualities(d) {
		return true;
	}

	isValidDescription(d) {
		return this.compareSize(d) && this.compareLewdness(d) && this.compareUsage(d) 
			&& this.compareArchitecture(d) & this.compareDecor(d) & this.compareState(d) 
			&& this.compareQualities(d);
	}

	toString() {
		let output = "";
		output += "Function:    "+ this.usage;
		output += "\nSize:    " + this.size;
		output += "\nLewdness:    "+ this.lewdness;
    	output += "\nArchitecture:    "+ this.architecture;
    	output += "\nDecor:    "+ this.decor;
    	output += "\nState:    " + this.state;

    	if(this.qualities.length < 1) {
    		output += "\nTrait:    Normal";
    	}
    	else {
    		for(let i = 0; i < this.qualities.length; ++i) {
    			output += "\nTrait:    " + this.qualities[i];
    		}
    	}
    	if(this.desc !== "") {
    		output += "\nPossible Description:    " + this.desc;
    	}
    	return output;
	}
}

var descMap = new Map();
descMap.set("000", 
	new RoomDescription(
		"000", //ID
		"Small", //size
		"", //lewdness
		"", //usage
		"", //architecture
		"", //decor
		"", //state
		[], //qualities
		"" //desc
	)
);

exports.RoomDescription = RoomDescription;
exports.descMap = descMap;