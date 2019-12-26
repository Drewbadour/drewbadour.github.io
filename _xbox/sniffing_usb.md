---
title:  "How to Sniff Xbox One Packets"
layout: single
classes: wide
excerpt: "How to sniff Xbox controller packets using USBPcap."
redirect_from:
  - /sniffing/index.html

categories: [xbox]
tags: [xbox, one, controller, usb, sniff, wireshark, usbpcap]
---

You may have been asked to sniff the packets of a controller, or maybe you're interested in sniffing the packets of a controller. The process of "sniffing" packets means that you will be capturing the traffic sent to and from a controller. Capturing this communication in a working system allows us to reverse engineer the communication and implement it in third-party drivers.


### Required Software
- Windows 7 or later
- Xbox One Controller Driver for PC
- [USBPcap](http://desowin.org/usbpcap/)

The driver is only required for systems that don't automatically recognize and install drivers for the controller.
{: .notice--info}

### Sniffing Data

- Plug in your controller
- Open the command prompt
- Navigate to the USBPcap directory
  - `cd "C:\Program Files\USBPcap`
- Run USBPcapCMD.exe, this will open a new window
  - `USBPcapCMD.exe`

![Navigate to the USBPcap directory](/assets/images/USBPcap.png)

- Find your controller (likely listed as "Xbox Gaming Device")
- Enter the filter number of the controller, not the port number
  - Filters are something like `2\\.\USBPcap2` while ports are listed as `[Port 2]`
- Unplug the controller from your system
- Give the file a name

![Run USBPcapCMD.exe, this will open a new window](/assets/images/USBPcapCMD.png)

- After sniffing has started, plug your controller into the system
- Press and release A, B, X, and then Y on the controller
- Press Ctrl + C on your keyboard, this will close the window
- Host your file on some service such as Google Drive or Dropbox and provide a link in your issue
  - The file will be located at `"C:\Program Files\USBPcap"`
