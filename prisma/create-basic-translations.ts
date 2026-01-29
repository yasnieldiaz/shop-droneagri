import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();

async function main() {
  const descEN = readFileSync('/tmp/basic-en.html', 'utf-8');
  const descES = readFileSync('/tmp/basic-es.html', 'utf-8');
  const descPL = readFileSync('/tmp/basic-pl.html', 'utf-8');

  const product = await prisma.product.findUnique({
    where: { sku: 'IM-XAG-PROP6' },
    include: { translations: true }
  });

  if (!product) {
    console.log('Producto IM-XAG-PROP6 no encontrado');
    return;
  }

  console.log('Producto encontrado:', product.id);
  console.log('Traducciones existentes:', product.translations.map(t => t.locale).join(', '));

  // Update English
  const enExists = product.translations.find(t => t.locale === 'en');
  if (enExists) {
    await prisma.productTranslation.update({
      where: { id: enExists.id },
      data: { description: descEN }
    });
    console.log('EN actualizado');
  }

  // Create or update Spanish
  const esExists = product.translations.find(t => t.locale === 'es');
  if (esExists) {
    await prisma.productTranslation.update({
      where: { id: esExists.id },
      data: { description: descES }
    });
    console.log('ES actualizado');
  } else {
    await prisma.productTranslation.create({
      data: {
        productId: product.id,
        locale: 'es',
        name: 'XAG P100 Pro Paquete Basico',
        description: descES
      }
    });
    console.log('ES creado');
  }

  // Create or update Polish
  const plExists = product.translations.find(t => t.locale === 'pl');
  if (plExists) {
    await prisma.productTranslation.update({
      where: { id: plExists.id },
      data: { description: descPL }
    });
    console.log('PL actualizado');
  } else {
    await prisma.productTranslation.create({
      data: {
        productId: product.id,
        locale: 'pl',
        name: 'XAG P100 Pro Pakiet Podstawowy',
        description: descPL
      }
    });
    console.log('PL creado');
  }

  console.log('Traducciones completadas!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
