CREATE TABLE "Services" (
    "Id" serial NOT NULL,
    "Servicio" character varying NOT NULL,
    "Date" timestamp NOT NULL,
    "Amount" character varying NOT NULL,
    CONSTRAINT "pk_Services" PRIMARY KEY ("Id")
);
