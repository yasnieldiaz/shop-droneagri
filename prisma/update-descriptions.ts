import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();

async function main() {
  const descEN = readFileSync('/tmp/desc-en.html', 'utf-8');
  const descES = readFileSync('/tmp/desc-es.html', 'utf-8');
  const descPL = readFileSync('/tmp/desc-pl.html', 'utf-8');

  const product = await prisma.product.findUnique({ where: { sku: 'IM-XAG-PROP5' } });
  if (!product) {
    console.log('Producto IM-XAG-PROP5 no encontrado');
    return;
  }

  console.log('Producto encontrado:', product.id);

  // Update English
  const enResult = await prisma.productTranslation.updateMany({
    where: { productId: product.id, locale: 'en' },
    data: { description: descEN }
  });
  console.log('EN actualizado:', enResult.count);

  // Update Spanish
  const esResult = await prisma.productTranslation.updateMany({
    where: { productId: product.id, locale: 'es' },
    data: { description: descES }
  });
  console.log('ES actualizado:', esResult.count);

  // Update Polish
  const plResult = await prisma.productTranslation.updateMany({
    where: { productId: product.id, locale: 'pl' },
    data: { description: descPL }
  });
  console.log('PL actualizado:', plResult.count);

  console.log('Descripciones actualizadas correctamente!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
