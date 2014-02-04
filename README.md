maksunappi
==========

A Node.js library for online payments in Finland.

##Bank configuration
The following table describes the different options you can use to configure the banks.
Those options are then mapped to the bank specific form fields.
E.g paymentVersion is mapped to 'NET_VERSION' in Aktia's case and to 'VERSIO' in DanskeBank's.

M = mandatory, O = optional, - = not in use

|  Field        | Aktia         | Ålandsbanken  | Danskebank | Handelsbanken | Nordea | Osuuspankki | S-Pankki | Tapiola |
| ------------- |  -------------|  -----        | ---------  |  ----------   |  ----  |    ------   |  ------  | ------  |
| paymentVersion|  M            |   M           |     M      |      M        |   M    |      M      |    M     |    M    |
| requestId     |  M            |   M           |     -      |      M        |   M    |      M      |    M     |    M    |
| vendorId      |  M            |   M           |     M      |      M        |   M    |      M      |    M     |    M    |
| vendorAccount |  -            |   M           |     -      |      -        |   O    |      -      |    M     |    M    |
| vendorName    |  -            |   M           |     –      |      -        |   O    |      -      |    M     |    M    |
| language      |  -            |   M           |     O      |      -        |   O    |      -      |    M     |    M    |
| amount        |  M            |   M           |     M      |      M        |   M    |      M      |    M     |    M    |
| currency      |  M            |   M           |     M      |      M        |   M    |      M      |    M     |    M    |
| reference     |  M            |   M           |     M      |      M        |   O    |      M      |    M     |    M    |
| dueDate       |  M            |   M           |     M      |      M        |   M    |      V      |    M     |    M    |
| message       |  -            |   -           |     –      |      -        |   O    |      O      |    -     |    -    |
| confirm       |  M            |   M           |     –      |      M        |   O    |      O      |    M     |    M    |
| keyVersion    |  -            |   M           |     -      |      -        |   M    |      M      |    M     |    M    |
| cookie        |  -            |   M           |     -      |      -        |   -    |      -      |    -     |    -    |
| algorithmType |  -            |   -           |     M      |      -        |   -    |      -      |    -     |    -    |
| mobile        |  -            |   -           |     -      |      -        |   O    |      -      |    -     |    -    |
|messageOnlyForWebForm | O      |   O           |     -      |      O        |   -    |      O      |    O     |    O    |

Notice that Aktia and Handelsbanken share the same mandatory and optional fields and so do S-Pankki and Tapiola.