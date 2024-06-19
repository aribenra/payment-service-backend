import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ScrapingService {
  private loginUrl = 'https://webapp16.sedapal.com.pe/socv/#/iniciar-sesion';
  private dataUrl = 'https://webapp16.sedapal.com.pe/socv/#/consulta-recibos';

  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async scrapeData(username: string, password: string): Promise<{ servicio: string, date: string, amount: string }> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
      // Navegar a la página de inicio de sesión
      await page.goto(this.loginUrl, { waitUntil: 'networkidle2', timeout: 10000 });
      console.log('Página de inicio de sesión cargada');

      // Esperar a que los campos estén presentes
      await page.waitForSelector('#mat-input-0', { timeout: 1000 });
      await page.waitForSelector('#mat-input-1', { timeout: 1000 });

      console.log('Campos de usuario y contraseña encontrados');

      // Rellenar el campo de usuario letra por letra
      for (let i = 0; i < username.length; i++) {
        await page.type('#mat-input-0', username[i], { delay: 100 });
      }
      console.log('Campo de usuario rellenado');

      // Rellenar el campo de contraseña letra por letra
      for (let i = 0; i < password.length; i++) {
        await page.type('#mat-input-1', password[i], { delay: 100 });
      }
      console.log('Campo de contraseña rellenado');

      // Esperar un momento para asegurarse de que los valores se han establecido
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verificar que los campos se han llenado correctamente
      const filledUsername = await page.$eval('#mat-input-0', el => (el as HTMLInputElement).value);
      const filledPassword = await page.$eval('#mat-input-1', el => (el as HTMLInputElement).value);

      console.log(`Filled Username: ${filledUsername}`);
      console.log(`Filled Password: ${filledPassword}`);

      if (filledUsername !== username || filledPassword !== password) {
        throw new Error('Los campos de usuario o contraseña no se llenaron correctamente');
      }

      console.log('Usuario y contraseña ingresados correctamente');

      // Agregar un retraso para asegurar que todo esté listo
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Asegurarse de que el botón es visible y clicable
      const loginButtonSelector = 'body > app-root > div > app-home > main > section > div > app-login > div > form > div:nth-child(3) > div > button';
      await page.waitForSelector(loginButtonSelector, { visible: true, timeout: 1000 });
      const loginButton = await page.$(loginButtonSelector);

      // Hacer clic en el botón de inicio de sesión
      if (loginButton) {
        await loginButton.click();
        console.log('Botón de inicio de sesión clicado');
      } else {
        throw new Error('Botón de inicio de sesión no encontrado');
      }

      // Esperar la navegación a la página de datos
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 500 });
      console.log('Navegación a la página de datos completada');

      // Navegar a la página de datos
      await page.goto(this.dataUrl, { waitUntil: 'networkidle2', timeout: 500 });
      console.log('Página de datos cargada');

      // Esperar que la tabla esté presente
      await page.waitForSelector('#tabla-pendientes > tbody > tr > td:nth-child(4)', { timeout: 5000 });
      console.log('Tabla encontrada');

      // Extraer los valores específicos
      const dateValueRaw = await page.$eval('#tabla-pendientes > tbody > tr > td:nth-child(3)', el => el?.textContent?.trim() || '');
      const amountValue = await page.$eval('#tabla-pendientes > tbody > tr > td:nth-child(4)', el => el?.textContent?.trim() || '');
      console.log('Valores extraídos:', { dateValueRaw, amountValue });

      // Limpiar los espacios en blanco de la fecha
      const cleanedDateValueRaw = dateValueRaw.replace(/\s+/g, '');
      // Convertir la fecha a un formato válido para PostgreSQL (YYYY-MM-DD)
      const dateParts = cleanedDateValueRaw.split('/');
      const dateValue = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      console.log('Fecha convertida:', dateValue);

      // Almacenar los datos en la base de datos
      const newService = this.serviceRepository.create({
        servicio: 'Agua',
        date: new Date(dateValue),
        amount: amountValue,
      });
      await this.serviceRepository.save(newService);

      await browser.close();
      return { servicio: 'Agua', date: dateValue, amount: amountValue };
    } catch (error) {
      console.error('Error during scraping:', error);
      await browser.close();
      throw new Error('Failed to scrape data');
    }
  }
}
