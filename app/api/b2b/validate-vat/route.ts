import { NextRequest, NextResponse } from 'next/server';

// Polish NIP validation
function validatePolishNIP(nip: string): boolean {
  // Remove any non-digits
  const cleanNip = nip.replace(/\D/g, '');

  if (cleanNip.length !== 10) {
    return false;
  }

  // NIP checksum weights
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanNip[i]) * weights[i];
  }

  const checksum = sum % 11;
  const lastDigit = parseInt(cleanNip[9]);

  return checksum === lastDigit;
}

// EU VAT format validation (basic)
const vatFormats: Record<string, RegExp> = {
  AT: /^ATU\d{8}$/,
  BE: /^BE[01]\d{9}$/,
  BG: /^BG\d{9,10}$/,
  CY: /^CY\d{8}[A-Z]$/,
  CZ: /^CZ\d{8,10}$/,
  DE: /^DE\d{9}$/,
  DK: /^DK\d{8}$/,
  EE: /^EE\d{9}$/,
  EL: /^EL\d{9}$/,
  ES: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/,
  FI: /^FI\d{8}$/,
  FR: /^FR[A-Z0-9]{2}\d{9}$/,
  HR: /^HR\d{11}$/,
  HU: /^HU\d{8}$/,
  IE: /^IE\d{7}[A-Z]{1,2}$|^IE\d[A-Z]\d{5}[A-Z]$/,
  IT: /^IT\d{11}$/,
  LT: /^LT(\d{9}|\d{12})$/,
  LU: /^LU\d{8}$/,
  LV: /^LV\d{11}$/,
  MT: /^MT\d{8}$/,
  NL: /^NL\d{9}B\d{2}$/,
  PL: /^PL\d{10}$/,
  PT: /^PT\d{9}$/,
  RO: /^RO\d{2,10}$/,
  SE: /^SE\d{12}$/,
  SI: /^SI\d{8}$/,
  SK: /^SK\d{10}$/,
};

// Validate EU VAT format
function validateVATFormat(countryCode: string, vatNumber: string): boolean {
  const fullVat = `${countryCode}${vatNumber.replace(/^[A-Z]{2}/, '')}`;
  const regex = vatFormats[countryCode];
  if (!regex) return false;
  return regex.test(fullVat);
}

// VIES SOAP validation
async function validateVIES(countryCode: string, vatNumber: string): Promise<{
  valid: boolean;
  name?: string;
  address?: string;
  error?: string;
}> {
  // Clean VAT number (remove country code if present)
  const cleanVat = vatNumber.replace(/^[A-Z]{2}/, '').replace(/\s/g, '');

  const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:tns1="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
  <soap:Body>
    <tns1:checkVat>
      <tns1:countryCode>${countryCode}</tns1:countryCode>
      <tns1:vatNumber>${cleanVat}</tns1:vatNumber>
    </tns1:checkVat>
  </soap:Body>
</soap:Envelope>`;

  try {
    const response = await fetch(
      'https://ec.europa.eu/taxation_customs/vies/services/checkVatService',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': '',
        },
        body: soapRequest,
      }
    );

    const text = await response.text();

    // Parse SOAP response
    const validMatch = text.match(/<valid>(\w+)<\/valid>/);
    const nameMatch = text.match(/<name>([^<]*)<\/name>/);
    const addressMatch = text.match(/<address>([^<]*)<\/address>/);

    if (validMatch) {
      return {
        valid: validMatch[1].toLowerCase() === 'true',
        name: nameMatch?.[1] || undefined,
        address: addressMatch?.[1] || undefined,
      };
    }

    // Check for fault
    const faultMatch = text.match(/<faultstring>([^<]*)<\/faultstring>/);
    if (faultMatch) {
      return {
        valid: false,
        error: faultMatch[1],
      };
    }

    return {
      valid: false,
      error: 'Could not parse VIES response',
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'VIES service unavailable',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryCode, vatNumber } = body;

    if (!countryCode || !vatNumber) {
      return NextResponse.json(
        { error: 'Country code and VAT number are required' },
        { status: 400 }
      );
    }

    const upperCountry = countryCode.toUpperCase();
    const cleanVat = vatNumber.replace(/\s/g, '');

    // Special handling for Poland (NIP)
    if (upperCountry === 'PL') {
      const nipOnly = cleanVat.replace(/^PL/, '');
      const isValid = validatePolishNIP(nipOnly);

      return NextResponse.json({
        valid: isValid,
        countryCode: 'PL',
        vatNumber: nipOnly,
        region: 'POLAND',
        message: isValid ? 'Valid Polish NIP' : 'Invalid Polish NIP',
      });
    }

    // Check if country is EU
    if (!vatFormats[upperCountry]) {
      return NextResponse.json({
        valid: false,
        countryCode: upperCountry,
        vatNumber: cleanVat,
        region: 'NON_EU',
        error: 'Country not in EU',
      });
    }

    // Validate format first
    if (!validateVATFormat(upperCountry, cleanVat)) {
      return NextResponse.json({
        valid: false,
        countryCode: upperCountry,
        vatNumber: cleanVat,
        region: 'EU',
        error: 'Invalid VAT number format',
      });
    }

    // Validate with VIES
    const viesResult = await validateVIES(upperCountry, cleanVat);

    return NextResponse.json({
      valid: viesResult.valid,
      countryCode: upperCountry,
      vatNumber: cleanVat,
      region: 'EU',
      companyName: viesResult.name,
      companyAddress: viesResult.address,
      error: viesResult.error,
    });
  } catch (error) {
    console.error('VAT validation error:', error);
    return NextResponse.json(
      { error: 'Validation service error' },
      { status: 500 }
    );
  }
}
