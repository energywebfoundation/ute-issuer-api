import { LoggerService } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { OriginAppModule } from './origin-app.module';

function getPort(): number {
    return parseInt(process.env.PORT, 10) || parseInt(process.env.BACKEND_PORT, 10) || 3030;
}

export async function startAPI(logger?: LoggerService) {
    const PORT = getPort();
    console.log(`UTE issuer backend starting on port: ${PORT}`);

    const app = await NestFactory.create(OriginAppModule.register());

    app.enableShutdownHooks();
    app.enableCors();
    app.setGlobalPrefix('api');

    if (logger) {
        app.useLogger(logger);
    }

    const options = new DocumentBuilder()
        .setTitle('Origin API')
        .setDescription('Swagger documentation for Origin API')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('swagger', app, document);

    await app.listen(PORT);

    return app;
}

startAPI()
    .then(() => {
        console.log('UTE issuer backend started');
    })
    .catch((e) => {
        console.log(`Error starting UTE Issuer API ${e.stack}`);
        process.exit(1);
    });
