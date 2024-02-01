# Serverless Search

POC showcasing the use of [LunrJS](https://lunrjs) with [Lambda]() for a server side serverless search api.

This example was made to use 2 data sources not provided in this example but easily accessible from their original sources:
* [Lego Sets](https://mavenanalytics.io/data-playground?search=lego+Sets)
* [Movies](https://www.kaggle.com/datasets/ashpalsingh1525/imdb-movies-dataset)

The sources are CSV files uploaded to S3. The index is generated when a new file is uploaded.

## Deploy
```bash
cp -a config/dev.sample.yml config/dev.yml
```
Edit `config/dev.yml` to your needs.

```bash
npx sls deploy
```
Take note of the bucket name and Lambda-URI endpoints.

## Index the 2 datasets
```bash
aws s3 cp lego_sets.csv s3://<myBucket>/source/lego_sets.csv
aws s3 cp imdb_movies.csv s3://<myBucket>/source/imdb_movies.csv
```

## Initiate a search
Pass a valid [LunrJS query](https://lunrjs.com/guides/searching.html) in the `search` parameter (URLEncoded):

```bash
curl "https://<SearchLegoLambdaURIEndpoint>/?search=%2Byear:1984%20%2Btheme:duplo"
```
