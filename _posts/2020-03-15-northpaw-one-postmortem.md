---
title: "Northpaw-One Postmortem"
excerpt: "What went right and what went wrong on the first Dopre keyboard"
toc: true

categories: [keyboard]
tags: [keyboard, embedded, dopre, topre, electrostatic, capacitive, hardware, software]
---

The Northpaw-One is the first keyboard ever made under the capacitive-sensing brand of "Dopre." It was a test of the feasibility of designing a completely custom electrostatic capacitive keyboard, and it worked. This postmortem will cover the results of this project from the software quirks to the hardware implementation.

If you haven't already already been introduced to Dopre, or how I got to this point, I recommend reading my [previous post on the general implementation of Dopre.]({% post_url 2020-01-01-hardware-behind-dopre %}) You'll be fine without reading it, but you might be missing some context on why I've done what I've done to make this board.

So without further ado, let's dig in.

## Hardware

Since the Northpaw-One is a completely custom built keyboard, I had to design most everything from the ground up. This means that I had to solve a variety of problems to even build a functioning keyboard.

Also note that the reversed layout was to prove a point that the Northpaw-One is a completely custom board, not relying on any existing case or PCB solution. I do personally prefer the "southpaw" style of keyboard, but it ends up being a striking statement of how custom this board is, every time you look at it.

<figure>
	<a href="/assets/images/northpaw_one_top_hhkb.jpg">
		<img src="/assets/images/northpaw_one_top_hhkb.jpg" alt="A top view of the Northpaw-One with a HHKB above it. The Northpaw-One has an acrylic top and a sandblasted stainless steel plate, with ePBT Japanese keycaps. The layout, from left to right, is: a tenkey, the navigation cluster, and then the alphas. Since it is a full sized keyboard, it also includes the F-keys.">
	</a>
	<figcaption>
		The Northpaw-One, compared to a stock HHKB Pro 2.
	</figcaption>
</figure>

### Case

Let's start with the easy stuff. This is a standard stacked acrylic case. The contents of the keyboard do not fit in this case. I made it way too small, and it's an absolute mess. But it's not an important part of the build. It was just designed to show off the contents of the keyboard. In the future, I'd like to re-evaluate how we build acrylic cases, but that's a different topic for a different day.

### Plate

There are a couple of things worth noting when it comes to the plate. First, the cutouts. Second, the mounting holes.

<figure>
	<a href="/assets/images/northpaw_one_plate.jpg">
		<img src="/assets/images/northpaw_one_plate.jpg" alt="An underside view of the Northpaw-One plate with a HHKB above it. The plate is populated with Niz housings and sliders, is made from brushed staineless steel, and has several holes cut in it that have been threaded for mounting.">
	</a>
	<figcaption>
		The underside of the Northpaw-One plate. Note the Niz housings/sliders and the Costar stabilizers.
	</figcaption>
</figure>

I used Niz housings in order to have Cherry keycap compatibility. So the plate has cutouts specifically sized for the Niz housings, which means that Topre housings will not fit. This also means that we need to find an alternate source of stabilization for larger keys. Ideally, we would use Cherry stabilizers on the board, but the wire of the stabilizer interferes with the top of the housing. Meaning that we either have to have specifically bent wires to support these housings, or we can use the already-available Costar stabilizers.

Let me assure you that Costar stabilizers are a terrible choice and this stabilizer problem is perhaps the biggest issue holding back custom electrostatic capacitive keyboards. Or you could just use small keycaps and avoid stabilization entirely. But I'm sure that some enterprising mechanical engineer will eventually find a solution to this problem. That is, unfortunately, outside of my wheelhouse.

| Housing Type | Width    | Height   | Corner                                 |
|--------------|----------|----------|----------------------------------------|
| Niz          | 14.16 mm | 14.16 mm | 0.6 mm radius                          |
| Topre 1U     | 14.6 mm  | 14 mm    | 1.0 mm chamfer                         |
| Topre 2U     | 32.4 mm  | 14 mm    | 3.0mm along bottom, at 30 degree angle |

Once again, thanks to [Tom Smalley][tomsmalleygit]'s [Custom Topre Guide][tomsmalley][^tomsmalley] for the dimensions of the Topre housings.

### PCB

The entire hardware implementation of a Dopre board is very simple. It uses a few resistors and capacitors, along with an op-amp, analog multiplexer, and a standard micro-controller and its integration circuitry. The design is notably devoid of diodes, meaning that there is far less soldering that needs to be done to complete construction of the board. This also results in a very cheap implementation, that is generally fairly effective. We'll get back to that later.

<figure>
	<a href="/assets/images/northpaw_one_bottom_hhkb.jpg">
		<img src="/assets/images/northpaw_one_bottom_hhkb.jpg" alt="A bottom view of the Northpaw-One with a HHKB above it. The bottom of the PCB is visible through a clear acrylic piece. There is a Proton C and Sparkfun ADC chip visible. Several terminals are visibly bridged with resistors. The main PCB has a huge Dopre logo running across its length. There is a small 'Designed in Texas' logo near the bottom.">
	</a>
	<figcaption>
		The underside view of the Northpaw-One.
	</figcaption>
</figure>

I was looking for an easy-to-implement solution that would allow me to build a prototype as fast as possible, so I chose to use a [Proton C][protonc] and an [analog multiplexer from Sparkfun][sparkfunanalogmux]. I also used an [OPA350A][opa350] that I had from testing, that was through-hole. This was a recommended Op-Amp from the [Custom Topre Guide][tomsmalley], which definitely works well for this purpose.

#### Capacitive Pads

I built the Northpaw-One in [KiCad][kicad]. I don't recommend following suit. KiCad does not natively support circular "keep-out" zones, which prove to be a fundamental feature that we need to build good electrostatic capacitive pads. As a result, I have been exploring [EAGLE][eaglecad] as an alternative solution. But let's get down to what makes this pad tick.

<figure>
	<a href="/assets/images/esc_pad_front_render.png">
		<img src="/assets/images/esc_pad_front_render.png" alt="A view of the KiCad 3D render of the front of an electrostatic capacitive pad. An inner circle has two connected traces running directly up and down. There is an outer white ring, with wto separate pads between the white ring and the inner circle.">
	</a>
	<figcaption>
		The KiCad 3D render of an electrostatic capacitive pad. Renders have more even lighting than reality.
	</figcaption>
</figure>

Every pad consists of two half-circles, separated by a ground trace. You'll notice that the pads contain no vias, and are merely connected to other traces on the board. In this above image, those are the two traces that run out the bottom of the white ring.

<figure>
	<a href="/assets/images/esc_pad_back_render.png">
		<img src="/assets/images/esc_pad_back_render.png" alt="A view of the KiCad 3D render of the back of an electrostatic capacitive pad. It consists of a circle with no copper, surrounded by a copper ground fill.">
	</a>
	<figcaption>
		The KiCad 3D render of the back of an electrostatic capacitive pad.
	</figcaption>
</figure>

You'll also notice that the underside of each pad is completely devoid of the ground plane. All of these aspects are important to the functionality of these pads. However, in order to make sure that the ground plane doesn't fill this circular area, PCB design software typically uses a thing called a "keep-out zone." These are zones that can be used to specify that other things should be "kept out" of the area that they specify. It's useful to stop traces from going through a critical area, but in our case, is used for keeping the ground fill out of these sections of the PCB. It is possible that having no ground plane at all might be an acceptable path to take, but then you would have to individually route traces for all of the ground lines between the half-circle pads.

<figure>
	<a href="/assets/images/esc_pad_front_pcb.png">
		<img src="/assets/images/esc_pad_front_pcb.png" alt="The pcbnew view of the front of an electrostatic capacitive pad. This reveals that the area previously covered by the white outer ring is a void, with no fill on either side of the PCB.">
	</a>
	<figcaption>
		The pcbnew view of an electrostatic capacitive pad.
	</figcaption>
</figure>

Similarly, there is a ground plane void under the white silk mask. The silk mask is there just to provide friction to help the mounting of the domes, but it hides some details of the pad. This is another application where a circular keep-out is useful. But it brings up another weakness of KiCad: no circular fills. Without either a circular keep-out or a circular-fill, it is impossible to create this shape in KiCad.

<figure>
	<a href="/assets/images/esc_pad_back_pcb.png">
		<img src="/assets/images/esc_pad_back_pcb.png" alt="The pcbnew view of the back of an electrostatic capacitive pad. This shows that there is no back fill around the pad.">
	</a>
	<figcaption>
		The pcbnew view of an electrostatic capacitive pad from the underside. Note that the ground fill on the underside is missing from the pad area, including the white ring.
	</figcaption>
</figure>

So, how did I get this working in KiCad? The answer is a Python script that creates a series of short straight lines that simulate something similar to a circular area. This script, in combination with KiCad, is *extremely* unstable. You are more likely to crash KiCad than actually get a result. It's incredibly frustrating to use, and I won't release the code on sheer principle. It's not even the script's fault. It's just that KiCad's integration with its scripting tools is so poor that it crashes the main program when you try to add that many segments all at once. If an enterprising Python programmer is looking to break up the code to try and make KiCad happy, you're welcome to reach out, but I don't believe that the code is of a level of quality that I want to have my name attached to, given the issues with KiCad.

#### Trace Routing

There's no rocket science here. The huge elephant in the room is "[parasitic capacitance][parasiticcap]." It's not as scary as it seems, at least not with this sensing solution. But the best way to avoid it is to not route your analog traces along-side any other traces. It should generally be easy to avoid, just be cognizant of it.

#### Sensing Solution

As discussed in [the previous post the topic]({% post_url 2020-01-01-hardware-behind-dopre %}), the sensing solution is an RC circuit that converts capacitance into a voltage. For further discussion on how this works, please reference that post. We'll talk more about how to actually implement that here.

<figure>
	<a href="/assets/images/rc_circ_mcu.png">
		<img src="/assets/images/rc_circ_mcu.png" alt="Schematic of the microcontroller portion of the circuit. There are pins labeled DRAIN, MUX_0, MUX_1, MUX_2, COL_1 through COL_17, and ADC_READ.">
	</a>
	<figcaption>
		The wiring on the Proton C. Note that the flags are inaccurate for input/output.
	</figcaption>
</figure>

So please understand that this is a fairly naive implementation done in support of simplicity and debug-ability, and I don't recommend copying it directly. I'll talk more about how to improve it in a later section. What's important to note in our design here are the new pins you've likely never seen before: `MUX_x`, `ADC_READ`, and `DRAIN`. These are all new pins in support of the analog circuitry that we'll come back to later. Also of note is that there are no `ROW_x` pins. These have all been replaced, thanks to the aforementioned new pins.

<figure>
	<a href="/assets/images/rc_circ_adc.png">
		<img src="/assets/images/rc_circ_adc.png" alt="Schematic of the analog multiplexer circuit. There are three 6 inputs labeled ROW_0 to ROW_5. Each of these lines has an individual 22K pull-down resistor and then connected. The MUX_x pins are used to select one of these inputs, which is sent out to ADC_OUT.">
	</a>
	<figcaption>
		The wiring of the ADC, showing that `ROW`s still exist, just barely.
	</figcaption>
</figure>

Okay, so I lied a little bit. Rows still exist. So a typical pad is connected to a column on one side, row on the other. Just like you might expect from a traditional mechanical switch. However, these `ROW_x` columns don't go back to the micro-controller. They run into this analog multiplexer. What this does is direct the line with a small capacitance into a new circuit. The multiplexer selects one of these rows at a time to be read by the sensing circuitry. You could also scale this system up to use multiple sets of this sensing circuitry. Just be aware that you will still be time locked by how fast your chip's ADC can read. If you reference the [Custom Topre Guide][tomsmalley], this means that the `ROW_x` values are what goes in to the "READ LINES FROM MATRIX" section of the original schematic.

<figure>
	<a href="/assets/images/rc_circ_opamp.png">
		<img src="/assets/images/rc_circ_opamp.png" alt="Schematic of the operational amplifier circuit. The circuit takes an input from ADC_OUT, which is connected through a 1K resistor to DRAIN_PIN, as well as through a 1nF capacitor to ground, as well as a 330 ohm resistor to the positive input of an op-amp. The output of the op-amp is set up as a non-inverting amplifier with output sent to ADC_READ a series 56K ohm resistor and 270 ohm tied to ground, connected back to the negative input channel. The op-amp is given a 3.3V input voltage and a ground negative voltage.">
	</a>
	<figcaption>
		The wiring of the Op-Amp circuit, showing the beating heart of Dopre that turns capacitance into voltage.
	</figcaption>
</figure>

So here's the where the magic happens. Once again, this is all of the circutry defined as part of the original design in the [Custom Topre Guide][tomsmalley]. This is just what it really looks like all hooked up. Further details have been covered in previous documentation. With this done, we have completed all of the PCB design for a Dopre-compatible project.

### Mounting

One of the biggest concerns I had was on how to mount the PCB to the plate properly. This is a non-trivial problem, as mounting force is a crucial part of ensuring that capacitance can be sensed correctly from the compressed springs. This is why other electrostatic capacitive boards have **SO MANY** screws. I chose to follow their lead and ended up tapping some 30-odd holes in the plate in order to mount screws up from the bottom of the PCB into the plate. Thankfully, the housings act as really great spacers, ensuring that you don't over-tighten your PCB. However, screws located near the edge of a PCB may require some sort of standoff or spacer to ensure that they do not flex the board. I chose to use 3/16 inch spacers for this application, but I think they were not required, in general. The application of these spacers is up to the individual designer.

It is worth noting that hand-tapping all of these screws was an awful experience that I wouldn't wish on my worst enemy. These will have to be shipped to consumers pre-tapped, or an alternative mounting mechanism would have to be found. I can't help but wonder if some sort of magnet-based mounting would be perfect for alignment and ease-of-modding. However, it is unclear how that would impact capacitive sensing performance at this time.

### Assembly

When assembling a Dopre-compatible board, the stack-up is a PCB connected directly to a plate, with the plate connected to the case. The PCB should never be connected to the case unless the plate is firmly connected to the PCB and nothing else. This helps ensure that the springs are appropriately mounted to plate and PCB combination.

<!-- TODO(Drew): Need an image to illustrate this here.. -->

The most important note about assembly is a note about using individual or small dome sheets with non-Topre housings. A Topre housing has a little plastic alignment piece on both sides that helps ensure that domes are appropriately oriented when mounted. Niz housings do not have this alignment piece. This means that domes can become misaligned during assembly of the keyboard. As of this time, I don't have any solutions to offer on this front other than to note that Niz sliders do fit in Topre housings. This is a design decision that will have to be considered by future Dopre implementers.

| Housing Type                    | Size of Housing Under Plate |
|---------------------------------|-----------------------------|
| Topre                           | 4.15 mm                     |
| Topre (including alignment nib) | 4.65 mm                     |
| Niz                             | 4.00 mm                     |

## Sensing

Dopre uses a modified version of the `matrix` that you may or may not be familiar with in QMK, along with some extra ADC code to sense the depth of a switch.

### Key Depth

The RC circuit that was discussed before results in a voltage relative to the capacitance of the circuit. This means that if no keys are pressed, the output voltage is low, and if a key is pressed, the output voltage is higher. This means that we need to read the voltage of every keyswitch individually. This process takes time. A whole lot more time than the digital circuits that we use with mechanical keyswitches. The STM32F303 has one of the fastest ADCs in the STM32 lineup if configured correctly. The ADC is perhaps the slowest part of this circuit and will define the speed at which you can read keys, so consider this part important.

The other important part to note is that this sensing mechanism is not one-to-one, full scale. What I mean by that is that having no keys pressed is not zero volts. In fact, it's somewhere closer to 2.5 volts, or about a 49 if you are measuring your voltages in 6-bit numbers like I did. This renders Dopre unsuitable for things like analog input.

#### The Time Problem

The more surprising (or perhaps expected) thing is that this solution doesn't result in a noticeable change in output from the ADC until the key is halfway pressed. This is because both the charging of the RC circuit and the reading from the ADC are time-based operations. To understand this, we need to talk about how an ADC works. I don't want to write a dissertation, so I'll gloss over some of the finer points. Essentially, the ADC takes a series of samples and then averages them all together. Since the RC circuit is also charging at the same time that the ADC is reading, the ADC starts with a few values close to zero volts, and then follows the charge curve up until it reaches its appropriate voltage. The problem with this is that it results in a reading that is extremely similar for the first 50% of a press of a key. Meaning that the actuation point (where the dome collapses) is (more or less) one ADC value different from not being pressed at all. This is... not ideal.

So the question stands: Is it possible to fix this? Yes, absolutely! But at what cost? If we allow the circuit to charge fully, then read the ADC value, we can get more accurate and valuable readings. But this means that you will be scanning keys less often, meaning that you have a lower board scan frequency, resulting in a less responsive keyboard. These are all trade-offs. Future work will be required to determine the optimal ways to interface with the ADC and system delays to allow this to be as accurate as possible.

### Grid

Since each key is read through the single `ADC_READ` pin, the grid layout is a little strange. For the Northpaw-One, I chose to run individual column pins, which were run to each ESC pad, with the opposite half of the pad routed to the analog multiplexer. This multiplexer then directed the correct row back to the RC circuit, and then the ADC. This is a bad implementation that I chose in order to make the software as easy to write as possible. In the future, a single "strobe" pin should be used instead of columns, with a separate set of demultiplexer select pins that exist to select the correct column to strobe off of a single drive pin.

<figure>
	<a href="/assets/images/rc_circ_grid.png">
		<img src="/assets/images/rc_circ_grid.png" alt="Schematic of a Dopre grid. There are many pads, with each one connected to a row on the left hand side, a column on the right hand side, and ground in the middle.">
	</a>
	<figcaption>
		A Dopre grid. Labels are delightful.
	</figcaption>
</figure>

## Conclusion

The Northpaw-One is a fully functional custom electrostatic capacitive board that demonstrates the Dopre implementation. This postmortem hopefully will serve as an implementation guide for those wanting to dive in to Dopre development before the design is complete. If you notice any issues or missing details, feel free to contact me and I'll fix or add them.

## Future Improvements

I will be investigating an alternative means of sensing in the near future, which will likely require a new Northpaw-One-like board. I will probably also stick to Topre housings personally in the future, as they feel better than the Niz housings in my personal opinion. Look out for future designs and write-ups here.

## Sources

[^tomsmalley]: https://github.com/tomsmalley/custom-topre-guide

[armadcpull]: https://github.com/qmk/qmk_firmware/pull/7681#issuecomment-597440452
[eaglecad]: https://www.autodesk.com/products/eagle/overview
[kicad]: https://kicad-pcb.org/
[opa350]: https://www.ti.com/product/OPA350
[parasiticcap]: https://en.wikipedia.org/wiki/Parasitic_capacitance
[protonc]: https://qmk.fm/proton-c/
[sparkfunanalogmux]: https://www.sparkfun.com/products/9056
[tomsmalley]: https://github.com/tomsmalley/custom-topre-guide
[tomsmalleygit]: https://github.com/tomsmalley
