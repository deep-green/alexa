openssl req -new -x509 -days 365 \
            -key private-key.pem \
            -config cnf.cnf \
            -out certificate.pem
