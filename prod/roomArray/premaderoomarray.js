const premadeRoomArray = [
    /*{name: "Water Park", description:
    //"The next room stands in stark contrast to the hallway outside, the air warm and damp. The place "
        + "itself is massive, with various attractions all connected to a massive pool surrounded in "
        + "concrete. Several concrete islands break up the monotony of the pool, with catwalks between the "
        + "islands serving as faster routes across as well as breaking line of sight. Some of the island are "
        + "even decorated, with fountains spraying water out into the pool around them. On the far side of "
        + "the pool are several massive water slides, twirling around one another as they make their way "
        + "down from a single point at the top of a long set of stairs. Various other attractions are "
        + "scattered about the edge of the pool, ranging from a looping lazy river to a shallow basin with "
        + "jets of water bursting up from beneath the surface at random locations and intervals."
    //},*/
    {name: "Gaming Lounge", description: 
    "The room is indeed cozy, separated by a large island counter into a small kitchen area and a lounge. "
        + "An incredibly soft and plush sofa rests on wooden floors, facing a large flatscreen TV, beneath "
        + "which lies a variety of different consoles from across the multiverse sat atop a small cupboard "
        + "that seems bigger on the inside. A few more reclining chairs are dotted around, and stools rest "
        + "against the counters. The kitchen is modest, with a microwave and a minifridge that seems stuffed "
        + "with snacks and drinks. A large window allows light in, though the view outside seems to change "
        + "occasionally."
    },
    {name: "Lewd Gym", description:
    "Beyond the door lies a rather large and absurdly opulent gymnasium. Several exercise devices rest in "
        + "neat rows on one side of the room, polished and gleaming. nearly half the hall is taken up by "
        + "some form of gilded court, teak flooring smooth and clean. An artificial river rings the entire "
        + "room, fed by several fountains built into the walls. Spanning this river are several stone "
        + "bridges, decorated with sleek and smooth marble statues that depict individuals in "
        + "oh-so-seductive positions. A woman leaning forward, her bust nearly springing forth from her "
        + "outfit. A man wearing nothing more than a thong, with other statues clearly gazing down just "
        + "below his waist. High ceilings extend upwards, covered exquisite paintings continuing this "
        + "theme, depicting fantastical beings clearly ogling one another, lithe bodies pressing together "
        + "as they perform all sorts of activities."
    },
    {name: "Crystal Mirror Meditation Room", description:
    "The room inside is octagonal in shape, with mirrors for walls allowing anyone inside to easily track "
        + "who might be behind them. Of greater import are a number of gleaming crystals that hover at "
        + "staggered heights at various points in the room, ranging from the size of an apple to a bowling "
        + "ball. Each crystal just draws the eye in so easily, helping the watcher to focus on whatever "
        + "they desire, making it so very easy to set aside all other worries, leaving only their goal and "
        + "the crystal. Always the crystal..."
    },
    {name: "Suspiciously Simple Mirrored Room", description:
    "The room itself is quite spacious, with three tables spread around the room at regular intervals. A "
        + "large potted plant sits in one corner of the room, next to a cabinet with an incense diffuser "
        + "resting on top. A few other decorations are spread throughout, including a bronze sculpture and "
        + "a large mirror, the dim light reflecting off the burnished silver to create a rather fascinating "
        + "pattern of lights on the floor."
    },
    {name: "Orb Room", description:
    "Beyond the wonderfully carved door lies a small and circular room, barely ten feet across. The floors "
        + "seem to be made of smooth marble, with eight large gold-rimmed mirrors stretching from floor to "
        + "ceiling at regular intervals along the similarly smooth walls. In the center of the room, a "
        + "granite table sits, surrounded by four chairs made from the same material. Upon the table, a "
        + "glass orb rests, gleaming oddly despite the bright lighting from an opulent chandelier hanging "
        + "above."
    },
    {name: "Water Park", description:
    "The room, if it can even be called that, stands in stark contrast to the hallway outside, the air warm "
        + "and damp. The area inside the door is massive, with various attractions all connected to a "
        + "massive pool surrounded in concrete. Several concrete islands break up the monotony of the pool, "
        + "with catwalks between the islands serving as faster routes across as well as breaking line of "
        + "sight. Some of the island are even decorated, with fountains spraying water out into the pool "
        + "around them. On the far side of the pool are several massive water slides, twirling around one "
        + "another as they make their way down from a single point at the top of a long set of stairs. "
        + "Various other attractions are scattered about the edge of the pool, ranging from a looping lazy "
        + "river to shallow basin with jets of water bursting up from beneath the surface at random "
        + "locations and intervals."
    },
    {name: "Subjective Gravity Fountain", description:
    "Inside the room, gravity feels...different. Less solid, almost. As if it were more of a guideline than "
        + "a fundamental rule. As if it would be trivial to push off from the linoleum floors and drift up "
        + "to one of the benches scattered along the walls. Droplets of water float about in midair, each "
        + "one following no particular rhyme or reason. But stepping back to view them as a whole reveals "
        + "a glorious pattern, as the drops of water twine themselves around beams of light, glittering "
        + "brilliantly as they orbit about. Eventually, each bead of water is drawn back towards the center "
        + "of the room, carrying the viewer's gaze along so easily. And in the center, illuminated by "
        + "spotlights mounted in each corner of the room, a sphere of water floats. From it, many streams "
        + "of water flow, each going in their own direction as they twist and curve around this central "
        + "point. The streams shift and weave through and around one another in a wondrous display, one "
        + "that is only enhanced by the particular way each stream catches the beams of light. Despite the "
        + "absolutely hypnotic twists and twirls, the streams ultimately curve back together, merging "
        + "seamlessly as they return to the fountain base, producing a rather soothing burble that seems "
        + "to tenderly ease away any stress as one listens."
    },
    {name: "Chocolate Fountain Room", description:
    "Massive tables line the walls of the large room, bearing all manner of confections and delights, each "
        + "one more chocolatey and decadent than the last. In the center of room, a massive chocolate "
        + "fountain sprays a liquid rain of melted sweetness, with trays of fruit resting on cabinets "
        + "surrounding the marvelous centerpiece."
    },
    {name: "Hypno-Arcade", description:
    "The room itself is huge, but not well lit, at least from above. Most of the light seems to come from a "
        + "variety of objects with flashing monitors, the stands a veritable riot of color as each attempts "
        + "to catch the eye of the observer. This seems to be an arcade of sorts. How interesting."
    },
    {name: "Idaia's Favorite Bathhouse", description:
    "A moderately small room covered in smooth tile floors, with half the room being taken up by a large "
        + "bath. Three of the walls are solid and covered in plaster, but the far wall, on the other side "
        + "of the bath, is made of smooth glass. On the other side,  massive gears turn in dizzyingly "
        + "intricate patterns, the faint clicking and whirring providing a steadying presence to the room."
    }, 
    {name: "Glass Ballroom", description: 
    "While the walls and ceiling seem to be made from large squares of frosted glass interspersed with "
        + "wrought iron supports, the floor is far more interesting. Every inch of it is covered in stained "
        + "glass paintings, each color separated by a razor-thin sheet of dark metal. The murals seem to be "
        + "etched into every part of the room, as if to convey some great epic to guests, though not a "
        + "single depiction seems to use any sorts of recognizable figures, opting to instead convey meaning "
        + "through abstract swirls and patterns. Every step one takes lets out a thrumming chime that echoes "
        + "through their mind, every color and tile unique in that regard. Perhaps the story is meant to be "
        + "told by traveling across the room?"
        + "\nOnce one manages to tear their eyes from the breathtaking works spread across the floor, it's "
        + "easy enough to notice that the room is nowhere near as devoid of furniture as it seemed at first "
        + "glance. Dozens of tables ringed by chairs are clustered near the walls, each piece made from the "
        + "same tinted glass as the floor, blending so seamlessly with its surroundings that it becomes "
        + "almost invisible. The center of the room remains devoid of any such distractions, instead "
        + "featuring a massive swirling painting that pulls the eye in more intensely than any other "
        + "composition in the room, almost begging for someone to traverse it."
    }, 
    {name: "Training Room", description: 
    "Stepping into the room, one would immediately note both the cleanliness of the room, the floor smooth, "
        + "glossy marble, yet still far from slippery, as well as the effect even simply entering held, a "
        + "hum of energy filling those who step beyond the threshold, enhancing abilities, whether they be "
        + "magical, physical, or even technological in nature. The walls seemed to be lined with small "
        + "sections, each holding room for one person, marked off with smooth grooves carved into the "
        + "floor. Each section held a metal plate hooked on the wall, seemingly on a door of some kind, "
        + "which resisted movement. Each plate had a basic drawing of some form of hypnosis, whether it be "
        + "natural or supernatural in nature. Perhaps it was meant to train? Whatever its purpose, stepping "
        + "into a sectioned off area would render one powerless, the hum of energy leaving them entirely, "
        + "leaving them nothing but their own will to protect them."
    },
    {name: "Mountain Fortress", description:
    "Located deep within the Nexus gardens, the mountain is a monolithic heap of rugged stone raised by a "
        + "visiting spellcaster. Once surrounded by a massive clearing, tall brambles now grow, leaving a "
        + "half-reclaimed road as the only path forward.  Two enormous stone gates have been carved out of "
        + "the mountain itself, standing at around 40 meters tall each, far heavier than most any mortal "
        + "could hope to move. One is ever so slightly ajar, allowing entry into a large pillared hall in "
        + "the center of the mountain. Inside the grandiose vestibule, numerous passages wind their way "
        + "outwards. Most of the stone corridors have been rendered impassable by time and the roots of "
        + "otherworldly plants, but a few remain traversable to the nimble traveler. Should one have a "
        + "particularly good eye, they may be able to make out a small balcony and what was once a "
        + "botanical garden near the top of the mountain, accessible through a single remaining stairwell "
        + "within the interior hall."
    },
    {name: "Vibrating Crystal Room", description:
    "A room filled with pale white crystals of all shapes and sizes. Upon touch, the crystals will begin to "
        + "vibrate faintly for as long as pressure is applied, with the strength of the vibrations "
        + "correlating to how hard they are pressed. Some may even release faint, melodic sounds when "
        + "activated in this way."
    },
    {name:"Egyptian Oasis?", description: 
    "The room seems to be the inside of a tomb, walls crafted from sturdy sandstone, old and dusty, but the "
        + "place is surprisingly lit with ethereal lights drifting like stars wandering across the ceiling "
        + "above. A pool of water as clear as the sky in the middle of the open room, reflecting those "
        + "glittering lights from above. Around the water, plants, palm trees, and vibrant flowers of all "
        + "colors and sizes sprout from a band of sand, sandstone bricks ringing the verdant oasis. There's "
        + "a hint of **something** in the air, the scent of fig leaves helping to cool and soothe and relax "
        + "anyone who breathes them in. Almost supernaturally so."
        + "\nAnyone who sets foot into the room will find their clothes transformed to a more appropriate, "
        + "perhaps more Egyptian style, completely without notice. In fact, those under this effect will not "
        + "think anything abnormal about their clothes until they depart. "
        + "\nNote: this room is a public entrance to Lapis Ahmet Merimut's home, though the doorway leading "
        + "to her lair is cleverly disguised. If you would like to have her take part in the scene, ask "
        + "Minion."
    },
    {name: "A Touch of Elation", description:
    "With a soundproof black door labeled in stylized white writing, the Touch of Elation's entrance is "
        + "relatively is hard to miss amongst the surrounding banal hallways. The door opens smoothly and "
        + "easily despite its weight, clearly soundproofed to prevent any noise from leaking out. Inside, "
        + "the dim lighting conceals the dozens of speakers and light fixtures built into various parts of "
        + "the ceiling, though rows of LED's built into the floor mark several paths in the darkness. Each "
        + "of these paths leads to a different destination, ranging from a full length bar constructed from "
        + "gleaming wood, to a large dance floor, to a pair of staircases leading up to a balcony "
        + "overlooking the entire area. Past the dance floor is a raised stage, clearly intended for "
        + "performances of various types, with full length curtains drawn across to allow stagehands to "
        + "prepare for the next act. Restrooms are clearly marked in multiple locations, no doubt a "
        + "necessity for an establishment like this. And tucked away in one corner, almost blending in with "
        + "the walls around it, is an elevator that doesn't seem to open no matter how many times drunkards "
        + "press the button. The entire place is decorated tastefully but trendily, adhering more to a chic "
        + "and modern aesthetic than anything else."
    },
    {name:"Enticing Fountain", description: 
    "The door opens up to a captivating new world. A large metallic circle with a fountain stands in front, "
        + "a multicolored disc of many different colored materials slowly spiraling outwards from the center "
        + "of the room. Four massive pillars tower over the pair, with large waterfalls being formed from "
        + "the top, falling into a mist around the circular platform. The land around them appears to be "
        + "resting upon the sky, with the swirling mist of the waterfalls being the only sign of anything "
        + "else in this room. The entire plaza is bathed in warm yellow hues from above, making everything "
        + "easily visible, but also not forming any shadows except directly underneath anything in the room. "
        + "Every part of this place is so vibrant, so lovely, so intense...perhaps too much so. Just being "
        + "in this place heightens the senses, renders every feeling so much stronger and more wonderful. Of "
        + "particular note is a delightfully sweet scent from the fountain's spray, making everything ever "
        + "so relaxing, the room even so gently, making it so much harder to even notice that the entrance "
        + "has disappeared, leaving behind only an empty platform floating a few feet off the ground."
        + "\nhttps://tinyurl.com/af2ds7dv"
    }

    //"Unknown"
];

module.exports = premadeRoomArray;