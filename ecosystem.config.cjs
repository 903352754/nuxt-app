module.exports = {
  apps: [
    {
      name: 'nuxt-demo',
      script: '.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        NUXT_MONGODB_URI: 'mongodb://sipeshardingxw41_db_user:***REMOVED***@ac-0iei0ep-shard-00-00.mqfe0za.mongodb.net:27017,ac-0iei0ep-shard-00-01.mqfe0za.mongodb.net:27017,ac-0iei0ep-shard-00-02.mqfe0za.mongodb.net:27017/?ssl=true&replicaSet=atlas-xhkwza-shard-0&authSource=admin&appName=Cluster0',
      },
    },
  ],
}
