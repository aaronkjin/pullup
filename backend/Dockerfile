FROM public.ecr.aws/lambda/python:3.9

# Install system dependencies required for psycopg2
RUN yum -y update && \
    yum -y install postgresql-devel gcc python3-devel && \
    yum clean all

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy function code
COPY *.py ${LAMBDA_TASK_ROOT}/

# Set the CMD to your handler
CMD [ "lambda_function.lambda_handler" ]