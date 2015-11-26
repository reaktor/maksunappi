maksunappi
==========
[![Build Status](https://travis-ci.org/reaktor/maksunappi.png?branch=master)](https://travis-ci.org/reaktor/maksunappi)

A Node.js library for online payments in Finland. Includes test
configurations for Nordea, DanskeBank, Handelsbanken, OP,
Aktia, Ålandsbanken, S-Pankki, Säästöpankki and POP Pankki.

Currently requires Express.

## About

![Reaktor](public/images/logo_reaktor.png "Reaktor")

From [Reaktor](http://reaktor.fi) with love.

Apply for juicy positions at [reaktor.com/careers](http://reaktor.com/careers) and prepare
for [The Culling](http://youtu.be/3Jym9rfQgec).

## Install

```
npm install maksunappi
```

## Testing

Run tests with grunt.

## Usage and configuration

### Basic usage (using default configurations)

```javascript
var generalOptions = {
  appHandler: app, // an Express application
  hostUrl: 'http://domain.here.com:port', // required for return URLs
  logger : logger //optional winston logger instance
};

var maksunappi = require('maksunappi').create(generalOptions);
```

## Bank configuration

### Changing configurations (code example)

```javascript
var bankOptions = [
  {
    id : 'nordea',
    imgPath : '/path/to/my/image.png',
    vendorId : 'production id',
    checksumKey : 'production key'
  },
  {
    id : 'op',
    name: 'Osuuspankki',
    algorithmType: 'sha256'
  }
];

var maksunappi = require('maksunappi').create(generalOptions, bankOptions);
```

The following options can only be configured in this initial configuration phase
(see "Bank configuration options" below for other options that can be configured
either here on on a per-request basis):

- `id` - identifier for the bank (this identifies the bank you are about to configure, see below for options)
- `paymentUrl` - url for the online payments service
- `imgPath` - path for the image used for the HTML form (or "button")
- `checksumKey` - vendor specific key used in computing the MAC

Possible values for `id` are:

| Bank          | ID            |
| ------------- | ------------- |
| Aktia         | aktia         |
| Danskebank    | danskebank    |
| Handelsbanken | handelsbanken |
| Nordea        | nordea        |
| Osuuspankki   | op            |
| POP Pankki    | poppankki     |
| S-Pankki      | spankki       |
| Säästöpankki  | saastopankki  |
| Ålandsbanken  | alandsbanken  |

Configuration options with an unrecognized `id` are ignored.

### Bank configuration options

The following table describes the different options you can use to configure banks.
These options are then mapped to bank specific form fields.
E.g paymentVersion is mapped to 'NET_VERSION' in Aktia's case and to 'VERSIO' in DanskeBank's.

Any of these options may be either set as general options for a bank in the initial
configuration or overridden in button options on a per-request basis.

The library performs minimal checks on inputs. Required fields are checked but
reference numbers and input lengths are generally not. Depending on the field
and bank, not observing the length limits specified in bank specific interface
specification documents may or may not have an effect on the success of the request.
Failure to provide an input for a required field results in an exception.

M = mandatory, O = optional, - = not in use

|  Field        | Aktia         | Ålandsbanken  | Danskebank | Handelsbanken | Nordea | Osuuspankki | POP Pankki  | S-Pankki | Säästöpankki |
| ------------- | ------------- | ------------- | ---------- | ------------- | ------ | ----------- | ----------- | -------- | ------------ |
| paymentVersion|  M            |   M           |     M      |      M        |   M    |      M      |      M      |    M     |       M      |
| requestId     |  M            |   M           |     -      |      M        |   M    |      M      |      M      |    M     |       M      |
| vendorId      |  M            |   M           |     M      |      M        |   M    |      M      |      M      |    M     |       M      |
| vendorAccount |  -            |   M           |     -      |      -        |   O    |      -      |      -      |    M     |       -      |
| vendorName    |  -            |   M           |     -      |      -        |   O    |      -      |      -      |    M     |       -      |
| language      |  -            |   M           |     O      |      -        |   O    |      -      |      -      |    M     |       -      |
| amount        |  M            |   M           |     M      |      M        |   M    |      M      |      M      |    M     |       M      |
| currency      |  M            |   M           |     M      |      M        |   M    |      M      |      M      |    M     |       M      |
| reference     |  M            |   M           |     M      |      M        |   O    |      M      |      M      |    M     |       M      |
| dueDate       |  M            |   M           |     M      |      M        |   M    |      O      |      M      |    M     |       M      |
| messageForBankStatement |  -  |   -           |     -      |      -        |   O    |      O      |      -      |    -     |       -      |
| confirm       |  M            |   M           |     -      |      M        |   O    |      O      |      M      |    M     |       M      |
| keyVersion    |  -            |   M           |     -      |      -        |   M    |      M      |      -      |    M     |       -      |
| cookie        |  -            |   M           |     -      |      -        |   -    |      -      |      -      |    -     |       -      |
| algorithmType |  -            |   -           |     M      |      -        |   -    |      -      |      -      |    -     |       -      |
| mobile        |  -            |   -           |     -      |      -        |   O    |      -      |      -      |    -     |       -      |
| messageForWebForm | O         |   O           |     -      |      O        |   -    |      O      |      O      |    O     |       O      |

Notice that Aktia and Handelsbanken share the same mandatory and optional fields.

Do remember to configure vendorName and vendorAccount for all banks which require them
when not using the test credentials (vendorId, checksumKey)!

#### Input formatting

Option values should be in the following formats:

|  Field        | Format                   | Example           | Notes                                                           |
| ------------- | ------------------------ | ----------------- | --------------------------------------------------------------- |
| paymentVersion| (convertible to) integer | 3 / "3" / "003"   | Is automatically formatted to comply with bank specifications.  |
| requestId     | string of numbers        | "201401301400391" | Integer values are fine too (watch out for floating point precision problems). |
| vendorId      | string                   | "TAPESHOPID" / "12345678"| |
| vendorAccount | string                   | "448710-126"      |          |
| vendorName    | string                   | "TESTIKAUPPA"     |          |
| language      | ISO 693-1 (string)       | "FI" / "SV" / "EN"| Note that some banks only support a subset of these languages ("FI"/"SV"). |
| amount        | floating point / integer | 25 / 50.5         |          |
| currency      | string                   | "EUR"             |          |
| reference     | string                   | "2014013014003919"| See "Generating reference numbers" below. |
| dueDate       | string / JavaScript Date | "EXPRESS" / `new Date()`| See "Additional notes" below |
| messageForBankStatement | string         |                   | Is automatically split into rows according to bank specifications. The message may be clipped if too long. Message is shown in the bank statement |
| confirm       | boolean                  | `true` / `false`  |                            |
| keyVersion    | (convertible to) integer |                   | Similar to paymentVersion. |
| cookie        | boolean                  |                   |                            |
| algorithmType | string                   | 'md5' / 'sha256'  | 'md5' is the default for most banks. |
| mobile        | boolean                  |                   |                            |
| messageForWebForm | string               |                   | message is only shown to the buyer in the webform                           |


***Additional notes concerning due dates:***

Always use either "EXPRESS" or a JavaScript Date object, not e.g. date strings.
"EXPRESS" works with all banks (for DanskeBank, the library converts it into a date).
Dates in the past are automatically converted into today's date.

Note that some banks (namely Ålandsbanken and S-Pankki) only allow
EXPRESS payments.

#### Mapping to form fields

The following table describes the mapping from options to bank specific form fields,
if you need to refer to the original specifications for help with parameters.

|  Field        | Aktia         | Ålandsbanken    | Danskebank | Handelsbanken | Nordea              | Osuuspankki     | POP Pankki    | S-Pankki        | Säästöpankki  |
| ------------- | ------------- | --------------- | ---------- | ------------- | ------------------- | --------------- | ------------- | --------------- | ------------- |
| paymentVersion| NET_VERSION   | AAB_VERSION     | VERSIO     | NET_VERSION   | SOLOPMT_VERSION     | VERSIO          | NET_VERSION   | AAB_VERSION     | NET_VERSION   |
| requestId     | NET_STAMP     | AAB_STAMP       |     -      | NET_STAMP     | SOLOPMT_STAMP       | MAKSUTUNNUS     | NET_STAMP     | AAB_STAMP       | NET_STAMP     |
| vendorId      | NET_SELLER_ID | AAB_RCV_ID      | KNRO       | NET_SELLER_ID | SOLOPMT_RCV_ID      | MYYJA           | NET_SELLER_ID | AAB_RCV_ID      | NET_SELLER_ID |
| vendorAccount |  -            | AAB_RCV_ACCOUNT |     -      |      -        | SOLOPMT_RCV_ACCOUNT |      -          |      -        | AAB_RCV_ACCOUNT |      -        |
| vendorName    |  -            | AAB_RCV_NAME    |     -      |      -        | SOLOPMT_RCV_NAME    |      -          |      -        | AAB_RCV_NAME    |      -        |
| language      |  -            | AAB_LANGUAGE    | lng        |      -        | SOLOPMT_LANGUAGE    |      -          |      -        | AAB_LANGUAGE    |      -        |
| amount        | NET_AMOUNT    | AAB_AMOUNT      | SUMMA      | NET_AMOUNT    | SOLOPMT_AMOUNT      | SUMMA           | NET_AMOUNT    | AAB_AMOUNT      | NET_AMOUNT    |
| currency      | NET_CUR       | AAB_CUR         | VALUUTTA   | NET_CUR       | SOLOPMT_CUR         | VALUUTTALAJI    | NET_CUR       | AAB_CUR         | NET_CUR       |
| reference     | NET_REF       | AAB_REF         | VIITE      | NET_REF       | SOLOPMT_REF         | VIITE           | NET_REF       | AAB_REF         | NET_REF       |
| dueDate       | NET_DATE      | AAB_DATE        | ERAPAIVA   | NET_DATE      | SOLOPMT_DATE        | ERAPVM          | NET_DATE      | AAB_DATE        | NET_DATE      |
| messageForBankStatement |  -  |   -             |     -      |      -        | SOLOPMT_MSG         | VIEST1 / VIEST2 |      -        |    -            |      -        |
| confirm       | NET_CONFIRM   | AAB_CONFIRM     |     -      | NET_CONFIRM   | SOLOPMT_CONFIRM     | VAHVISTUS       | NET_CONFIRM   | AAB_CONFIRM     | NET_CONFIRM   |
| keyVersion    |  -            | AAB_KEYVERS     |     -      |      -        | SOLOPMT_KEYVERS     | TARKISTE-VERSIO |      -        | AAB_KEYVERS     |      -        |
| cookie        |  -            | BC_UseBVCookie  |     -      |      -        |   -                 |      -          |      -        |    -            |      -        |
| algorithmType |  -            |   -             | ALG        |      -        |   -                 |      -          |      -        |    -            |      -        |
| mobile        |  -            |   -             |     -      |      -        | SOLOPMT_PMTTYPE     |      -          |      -        |    -            |      -        |
| messageForWebForm |NET_MSG    | AAB_MSG         |     -      | NET_MSG       |   -                 | VIESTI          | NET_MSG       | AAB_MSG         | NET_MSG       |

### Create payment HTML forms for configured banks

```javascript
var requestId = "123456789876543";
var referenceNum = <generate reference here>; // see "Generating reference numbers" below
var options = {
                requestId: requestId,
                amount: 25,
                messageForBankStatement: "Lorem ipsum dolor sit amet...",
                reference: referenceNum,
                language: 'FI'
              };

var buttonHtml = maksunappi.paymentButton('nordea', options);
```

...or if you just want the request parameters without generating any HTML:

```javascript
var params = maksunappi.buildRequestParams('nordea', options);
```

### Generating reference numbers / check numbers

Finnish reference number:

```javascript
var numericIdentifier = '1234556789'; // e.g. a timestamp + an id
var referenceNumber = maksunappi.referenceNumbers.toFinnishPaymentReference(numericIdentifier);
```

International RF reference number (might not be supported by all banks):

```javascript
var referenceNumber = maksunappi.referenceNumbers.toRFReference(finnishReferenceNumber);
```

Usually if the bank requires both a requestId and a reference, you should
use the requestId as the basis (numericIdentifier) for the reference number.

### Get a listing of all configured banks (IDs)

```javascript
var banks = maksunappi.banks
// => ['danskebank', 'handelsbanken', 'nordea',
//     'op', 'aktia', 'alandsbanken', 'spankki']
```

### Response handling

The module binds paths `/epayments/ok/<bank id>` (GET and POST, for all bank ids),
`/epayments/cancel` (only GET) and `/epayments/reject` (only GET) to the given
Express app for use as return urls.

Response handling is event based.

```javascript
maksunappi.on('success', function (request, response, data) {
  // Payment was successful and the customer returned to the site.
  // Normalized query data can be accessed in the data parameter.
  // Note: for many banks, the query string is empty unless the "confirm"
  // parameter is set to true.
});

maksunappi.on('mac-check-failed', function (request, response, data) {
  // Same as above but MAC check failed, so the data was faulty.
});

maksunappi.on('cancel', function (request, response) {
  // User cancelled the payment.
});

maksunappi.on('reject', function (request, response) {
  // The payment was rejected by the bank.
});
```

### Normalized response data

The normalized query string data contains the following fields:

X = present, - = not present

|  Field        | Aktia         | Ålandsbanken  | Danskebank | Handelsbanken | Nordea | Osuuspankki | POP Pankki    | S-Pankki | Säästöpankki  |
| ------------- | ------------- | ------------- | ---------- | ------------- | ------ | ----------- | ------------- | -------- | ------------- |
| version       |  X            |   X           |     X      |      X        |   X    |      X      |       X       |    X     |       X       |
| requestId     |  X            |   X           |     -      |      X        |   X    |      X      |       X       |    X     |       X       |
| reference     |  X            |   X           |     X      |      X        |   X    |      X      |       X       |    X     |       X       |
| archivedId    |  X            |   X           |     -      |      X        |   X    |      X      |       X       |    X     |       X       |
| mac           |  X            |   X           |     X      |      X        |   X    |      X      |       X       |    X     |       X       |
| algorithm     |  X            |   -           |     -      |      X        |   -    |      -      |       X       |    -     |       X       |
| macVersion    |  -            |   -           |     -      |      -        |   -    |      X      |       -       |    -     |       -       |
| currency      |  -            |   -           |     X      |      -        |   -    |      -      |       -       |    -     |       -       |
| vendorId      |  -            |   -           |     X      |      -        |   -    |      -      |       -       |    -     |       -       |
| dueDate       |  -            |   -           |     X      |      -        |   -    |      -      |       -       |    -     |       -       |
| paymentStatus |  -            |   -           |     X      |      -        |   -    |      -      |       -       |    -     |       -       |
| paymentSum    |  -            |   -           |     X      |      -        |   -    |      -      |       -       |    -     |       -       |
| paymentMethod |  -            |   -           |     X      |      -        |   -    |      -      |       -       |    -     |       -       |

Version numbers (version, macVersion) are converted to integers in the normalized data.

### Sample application

See `sample/app.js` for a simple usage example. Run the
sample app locally with `node sample/start-sample.js`.