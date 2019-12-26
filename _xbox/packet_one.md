---
title:  "Xbox One Controller Packet Docs"
layout: single
excerpt: "Documentation on the packets sent to and from an Xbox One controller."
redirect_from:
  - /packetformat/packetformat.html
toc: true

categories: [xbox]
tags: [xbox, one, controller, documentation, usb]
---

Thanks to [Pekka Pöyry (quantus)][quantus] for [a lot of the documentation of Xbox One Controller packets.][quantus-docs]


## Packets Sent To Controller

It is incredibly important that the counter is maintained on packets sent to the controller. For example, the controller will ignore any rumble packets that do not have the correct counter. The very first init packet must have a counter value of 0, from there on out simply add 1 to a `uint8_t` to maintain the number every time a packet is sent. For example:

```
uint8_t outCount = 0;
uint8_t xoneInit1[] = { 0x05, 0x20, outCount++, 0x09, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x55, 0x53 }; // 0
uint8_t xoneInit2[] = { 0x05, 0x20, outCount++, 0x01, 0x00 }; // 1
uint8_t xoneInit3[] = { 0x0a, 0x20, outCount++, 0x03, 0x00, 0x01, 0x14 }; // 2
uint8_t xoneInit4[] = { 0x09, 0x00, outCount++, 0x09, 0x00, 0x0f, 0x00, 0x00, 0x1d, 0x1d, 0xff, 0x00, 0x00 }; // 3
```
{: .language-c}

---

### `0x01` Guide Button Response

```
01:20:00:09:00:07:20:02:00:00:00:00:00
-----
Constant Header:
[00] 01: Header
[01] 20: Constant 0x20
[02] 00: This value needs to be the same as the request
[03] 09: Substructure (Length)
-----
[04] 00: Undocumented
[05] 07: Constant 0x07
[06] 20: Constant 0x20
[07] 02: Constant 0x02
[08] 00: Undocumented
[09] 00: Undocumented
[10] 00: Undocumented
[11] 00: Undocumented
[12] 00: Undocumented
```
```
typedef struct {
    uint8_t packetType;
    uint8_t unknown1;
    uint8_t requestNum;
    uint8_t size;

    uint8_t const00;
    uint8_t const07;
    uint8_t const20;
    uint8_t const02;
    uint8_t[5] padding;
} XBOXONE_LOAD_RUMBLE;
```
{: .language-c}

This response must be returned to all guide button packets that contain a `0x30` instead of a `0x20` in their header. [Further information about applicable packets can be found here.][quantus-docs] The bulk of the packet is constant values, the most important part is that the `[02]` value is the same as the `[02]` value in the request packet.

---

### `0x04` Undocumented Start

```
04:20
-----
04:20:01:00
```

Controller lights up, but will not accept data and sends unknown response packets. This packet is using during the init sequence, but its use is undocumented. The first packet is the least data required to use the `0x04` header. The second packet is used in the controller init sequence. More documentation available at [quantus's repository.][quantus-docs]

---

### `0x05` Init Controller

```
05:20
-----
05:20:02:09:06:00:00:00:00:00:00:55:53
05:20:03:01:00
```

This packet is used to start the controller in a mode in which data can be sent and received from the controller. The first packet is the least data required to use the `0x05` header. The second packet is used in the controller init sequence. More documentation available at [quantus's repository.][quantus-docs]

---

### `0x06` Undocumented Crash

```
06:20:00:10:00:08:00:00:38
-----
06:20:00:02:00:02
```

Crashes the controller. More documentation available at [quantus's repository.][quantus-docs]

---

### `0x07` Load Rumble Effect

```
07:85:a0:20:20:30:20:02:00
-----
[00] 07: Header
[01] 85: At least one of the 0x07 bits must be on
[02] a0: Counter
[03] 20: Left motor / little motor force
[04] 20: Right motor / big motor force
[05] 30: Length
[06] 20: Period
[07] 02: Repeat count. Ex. 0x02 plays effect 1 + 0x02 times
[08] 00: Undocumented
```
```
typedef struct {
    uint8_t packetType;
    uint8_t unknown1;
    uint8_t counter;
    uint8_t littleForce;
    uint8_t bigForce;
    uint8_t length;
    uint8_t period;
    uint8_t repeatCount;
    uint8_t unknown2;
} XBOXONE_LOAD_RUMBLE;
```
{: .language-c}

This packet is used to load a rumble effect for the controller to use. More documentation available at [quantus's repository][quantus-docs].

---

### `0x09` Activate Rumble Effect

```
09:08:00:02:00:0f:04:04                Short Packet
09:08:00:04:00:0f:04:04                Play Effect
09:08:00:08:00:0f:04:04:20:20:80:00    Continuous Rumble
09:08:00:09:00:0f:04:04:20:20:80       Single Rumble
-----
Constant Header:
[00] 09: Header
[01] 08: 0x20 bit and all bits of 0x07 prevents rumble effect
[02] 00: Undocumented, probably a counter
[03] ??: Substructure (Length)
-----
Short Packet:
[03] 02: Substructure (Length)
[04] 00: Mode
[05] 0f: Rumble mask
     Bit 0: Big motor
     Bit 1: Little motor
     Bit 2: Right trigger
     Bit 3: Left trigger
[06] 04: Left trigger force
[07] 04: Right trigger force
-----
Play Effect:
[03] 04: Substructure (Length)
[04] 00: Mode
[05] 0f: Rumble mask
     Bit 0: Big motor
     Bit 1: Little motor
     Bit 2: Right trigger
     Bit 3: Left trigger
[06] 04: Left trigger force
[07] 04: Right trigger force
-----
Continuous Rumble:
[03] 08: Substructure (Length)
[04] 00: Mode
[05] 0f: Rumble mask
     Bit 0: Big motor
     Bit 1: Little motor
     Bit 2: Right trigger
     Bit 3: Left trigger
[06] 04: Left trigger force
[07] 04: Right trigger force
[08] 20: Left motor / little motor force
[09] 20: Right motor / big motor force
[10] 80: Length of pulse
[11] 00: Period between pulses
-----
Single Rumble:
[03] 08: Substructure (Length)
[04] 00: Mode
[05] 0f: Rumble mask
     Bit 0: Big motor
     Bit 1: Little motor
     Bit 2: Right trigger
     Bit 3: Left trigger
[06] 04: Left trigger force
[07] 04: Right trigger force
[08] 20: Left motor / little motor force
[09] 20: Right motor / big motor force
[10] 80: Length of pulse
```
```
typedef struct {
    uint8_t command;
    uint8_t unknown1;
    uint8_t counter;
    uint8_t size;
} XBOXONE_HEADER;
typedef struct {
    XBOXONE_HEADER header;
    uint8_t mode;
    uint8_t rumbleMask;
    uint8_t trigL, trigR;
} XBOXONE_SHORT_RUMBLE;
typedef struct {
    XBOXONE_HEADER header;
    uint8_t mode;
    uint8_t rumbleMask;
    uint8_t trigL, trigR;
} XBOXONE_PLAY_RUMBLE;
typedef struct {
    XBOXONE_HEADER header;
    uint8_t mode;
    uint8_t rumbleMask;
    uint8_t trigL, trigR;
    uint8_t little, big;
    uint8_t length;
} XBOXONE_SINGLE_RUMBLE;
typedef struct {
    XBOXONE_HEADER header;
    uint8_t mode;
    uint8_t rumbleMask;
    uint8_t trigL, trigR;
    uint8_t little, big;
    uint8_t length;
    uint8_t period;
} XBOXONE_CONTINUOUS_RUMBLE;
```
{: .language-c}

This packet is used to create an immediate rumble effect for the controller to use. More documentation available at [quantus's repository.][quantus-docs]

---

### `0x0A` Change LED
```
Constant Header:
[00] 0a: Header
[01] 20: Constant 0x20
[02] 04: Undocumented, probably a counter
[03] ??: Substructure (Length)
-----
LED Data:
[04] 00: Constant 0x00
[05] ??: Command
[06] ??: Brightness (0x00 - 0x20)
```
```
typedef struct {
    uint8_t command;
    uint8_t unknown1;
    uint8_t counter;
    uint8_t size;

    uint8_t const00;
    uint8_t command;
    uint8_t brightness;
} XBOXONE_CONTINUOUS_RUMBLE;
typedef enum {
    XONE_LED_OFF_1           = 0x00,
    XONE_LED_SOLID           = 0x01,
    XONE_LED_BLINK_FAST      = 0x02,
    XONE_LED_BLINK_SLOW      = 0x03,
    XONE_LED_BLINK_VERY_SLOW = 0x04,
    XONE_LED_SOLD_1          = 0x05,
    XONE_LED_SOLD_2          = 0x06,
    XONE_LED_SOLD_3          = 0x07,
    XONE_LED_PHASE_SLOW      = 0x08,
    XONE_LED_PHASE_FAST      = 0x09,
    XONE_LED_REBOOT_1        = 0x0a,
    XONE_LED_OFF             = 0x0b,
    XONE_LED_FLICKER         = 0x0c,
    XONE_LED_SOLID_4         = 0x0d,
    XONE_LED_SOLID_5         = 0x0e,
    XONE_LED_REBOOT_2        = 0x0f,
} LED_XONE;
```
{: .language-c}

These are untested by me and taken from another person's data sniffing. More documentation available at [quantus's repository, from the original poster.](https://github.com/quantus/xbox-one-controller-protocol/issues/5)

---

## Packets Sent From Controller

### `0x00` Unknown

Unknown. More documentation available at [quantus's repository.][quantus-docs]

---

### `0x01` Unknown

```
typedef struct {
    uint8_t packetType;
    uint8_t const20;
    uint8_t constFF;
    uint8_t const09
    uint8_t const0;
    uint8_t query1;
    uint8_t query2;
    uint16_t unknown1;
    uint32_t unknown2;
} XBOXONE_UNKNOWN_OUT_01;
```
{: .language-c}

Unknown. More documentation available at [quantus's repository.][quantus-docs]

---

### `0x02` Waiting Connection

```
typedef struct {
    uint8_t packetType;
    uint8_t const20;
    uint16_t id;
} XBOXONE_AWAITING_CONNECTION;
```
{: .language-c}

This is sent periodically when the controller hasn't been started yet. More documentation available at [quantus's repository.][quantus-docs]

---

### `0x03` Heartbeat

```
typedef struct {
    uint8_t packetType;
    uint8_t const20;
    uint8_t counter;
    uint8_t size;

    uint8_t const80;
    uint8_t dummy1;
    uint8_t dummy2;
    uint8_t dummy3;
} XBOXONE_HEARTBEAT;
```
{: .language-c}

This is sent periodically after the controller has been started. It probably holds important data for wireless controllers. More documentation available at [quantus's repository.][quantus-docs]

---

### `0x04` Unknown

```
typedef struct {
    uint8_t packetType;

    uint8_t unknown[0x3f];
} XBOXONE_UNKNOWN_OUT_04;
```
{: .language-c}

Unknown. More documentation available at [quantus's repository.][quantus-docs]

---

### `0x06` Unknown

```
typedef struct {
    uint8_t packetType;
    uint8_t const30;
    uint8_t counter;
    uint8_t size;

    uint8_t const00;
    uint8_t unknown[5];
} XBOXONE_UNKNOWN_OUT_06;
```
{: .language-c}

Unknown. More documentation available at [quantus's repository.][quantus-docs]

---

### `0x07` Guide Button Packet

```
typedef struct {
    uint8_t packetType;
    uint8_t const20;
    uint8_t counter;
    uint8_t size;

    uint8_t guideButtonState;
    uint8_t const5B;
} XBOXONE_GUIDE_REPORT_ORIG;
typedef struct {
    uint8_t packetType;
    uint8_t const30;
    uint8_t counter;
    uint8_t size;

    uint8_t guideButtonState;
    uint8_t const5B;
} XBOXONE_GUIDE_REPORT_NEW;
```
{: .language-c}

This packet is sent whenever the guide button is pressed. Probably has more implications for wireless controllers. The format changed to the second listed struct exclusively for the Bluetooth capable controllers. In this second struct, the controller the controller continuously sends notifications of guide button press until an ack is returned from the host. [The response content can be found here.](#0x01-guide-button-response) The layouts are identical. The only identifier is that the Bluetooth controller version has a constant `0x30` instead of `0x20`. More documentation available at [quantus's repository.][quantus-docs]

---

### `0x20` Button Packet

```
typedef struct {
    uint8_t packetType;
    uint8_t reserved1;
    uint8_t counter;
    uint8_t size; // 0x0e

    uint16_t buttons;
    uint16_t trigL, trigR;
    int16_t leftX, leftY, rightX, rightY;
} XBOXONE_BUTTON_REPORT;
typedef struct {
    uint8_t packetType;
    uint8_t reserved1;
    uint8_t counter;
    uint8_t size; // 0x1d

    uint16_t buttons;
    uint16_t trigL, trigR;
    int16_t leftX, leftY, rightX, rightY;

    uint16_t true_buttons;
    uint16_t true_trigL, true_trigR;
    int16_t true_leftX, true_leftY, true_rightX, true_rightY;
    uint8_t paddle;
} XBOXONE_ELITE_BUTTON_REPORT;
typedef enum {
    XONE_SYNC           = 0x0001, // Bit 00
    XONE_MENU           = 0x0004, // Bit 02
    XONE_VIEW           = 0x0008, // Bit 03
    XONE_A              = 0x0010, // Bit 04
    XONE_B              = 0x0020, // Bit 05
    XONE_X              = 0x0040, // Bit 06
    XONE_Y              = 0x0080, // Bit 07
    XONE_DPAD_UP        = 0x0100, // Bit 08
    XONE_DPAD_DOWN      = 0x0200, // Bit 09
    XONE_DPAD_LEFT      = 0x0400, // Bit 10
    XONE_DPAD_RIGHT     = 0x0800, // Bit 11
    XONE_LEFT_SHOULDER  = 0x1000, // Bit 12
    XONE_RIGHT_SHOULDER = 0x2000, // Bit 13
    XONE_LEFT_THUMB     = 0x4000, // Bit 14
    XONE_RIGHT_THUMB    = 0x8000, // Bit 15
} XBOXONE_BUTTONS;
typedef enum {
    XONE_PADDLE_UPPER_LEFT      = 0x0001, // Bit 00
    XONE_PADDLE_UPPER_RIGHT     = 0x0002, // Bit 01
    XONE_PADDLE_LOWER_LEFT      = 0x0004, // Bit 02
    XONE_PADDLE_LOWER_RIGHT     = 0x0008, // Bit 03
    XONE_PADDLE_PRESET_NUM      = 0x0010, // Bit 04
} XBOXONE_ELITE_PADDLES;
```
{: .language-c}

The button packet the controller sends every time there is a change in the state of the controller. The Elite controller has a slightly larger and more complicated packet. The `true_` portion of the Elite packet is what buttons are truly being pressed. If buttons are mapped differently using the controller tool, the real button pressed will appear in the `true_` section, but it will report as the binding in the normal `buttons` packet. More documentation available at [quantus's repository.][quantus-docs]


[quantus]: https://github.com/quantus
[quantus-docs]: https://github.com/quantus/xbox-one-controller-protocol
