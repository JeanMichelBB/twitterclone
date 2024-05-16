# twitterclone

<!-- frontend react-vite -->
<!-- requirement.txt -->

## Project setup
```
npm install
```


### Compiles and hot-reloads for development
```
npm run dev
```

### Compiles and minifies for production
```
npm run build
```



<!-- backend FastAPI -->

## Backend setup
```
python3 -m venv myenv
source myenv/bin/activate
pip install -r requirements.txt
```

### Run backend
```
uvicorn app.main:app --reload
```
pip3 install -r requirements.txt --break-system-packages
pip3 install --upgrade setuptools wheel --break-system-packages


uvicorn main:app --host 127.0.0.1 --port 8000 --reload

<!-- dastabase-->

## Database setup
```

mysql -u root -p


```
SET FOREIGN_KEY_CHECKS = 0;
SET @tables = NULL;
SELECT GROUP_CONCAT(table_schema, '.', table_name) INTO @tables
  FROM information_schema.tables
  WHERE table_schema = 'mydb';

SET @tables = CONCAT('DROP TABLE ', @tables);
PREPARE stmt FROM @tables;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET FOREIGN_KEY_CHECKS = 1;
```
```
SELECT * FROM `mydb`.`followers` LIMIT 1000;
SELECT * FROM `mydb`.`likes` LIMIT 1000;
SELECT * FROM `mydb`.`messages` LIMIT 1000;
SELECT * FROM `mydb`.`notifications` LIMIT 1000;
SELECT * FROM `mydb`.`retweets` LIMIT 1000;
SELECT * FROM `mydb`.`tweets` LIMIT 1000;
SELECT * FROM `mydb`.`users` LIMIT 1000;
```
