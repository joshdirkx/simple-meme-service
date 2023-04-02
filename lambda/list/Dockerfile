FROM public.ecr.aws/lambda/nodejs:18

COPY package.json index.js ${LAMBDA_TASK_ROOT}

RUN npm install

CMD [ "index.handler" ]
