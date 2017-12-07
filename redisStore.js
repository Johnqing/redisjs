const redis = require('redis');
/**
 * const rs = new RedisStore({
 *  host:'127.0.0.1',
 *  port: '6379',
 *  db: 0,
 *  pass: 'xxxxxxx',
 *  prefix: 'prefix',
 *  ttl: 10000
 * });
 *
 *
 * rs.get(xx).then((result) => {console.log(result)});
 *
 */
class RedisStore {
	constructor(options = {}) {
		this.dbOptions = {
			host: options.host,
			port: options.port || '6379',
			db: options.db || 0,
			pass: options.pass
		};

		this.ttl = options.ttl;
		this.prefix = !options.prefix ? 'RS:' : `${options.prefix}:`;

		this.create();
	}

	/**
	 * 连接客户端
	 */
	create() {
		// client
		this.client = this.client ? this.client : redis.createClient(this.dbOptions);

		this.client.on('ready', function (err) {
			if (err) {
				return;
			}
		});
		this.client.auth(this.dbOptions.pass, function (err) {
			if (err) {
				return;
			}
		});

		this.client.on('error', function (err) {
		});

		this.client.select(this.dbOptions.db);

		this.client.on('connect', ()=> {
			this.client.select(this.dbOptions.db);
		});
	}

	/**
	 * 获取数据
	 * @param key
	 * @returns {Promise}
	 */
	get(key) {
		const pkey = this.prefix + key;

		return new Promise((resolve, reject) => {
			this.client.get(pkey, (err, data)=> {
				if (!data) {
					return resolve(null);
				}

				let result = data.toString();

				try {
					result = JSON.parse(data);
				}
				catch (er) {
					//logger.error('[GET]', '[ERROR]', pkey, er);
				}
				return resolve(result);
			})
		});
	}

	/**
	 * 新增一条数据
	 * @param key
	 * @param val   值，非jsonstring的情况，直接插入原值
	 * @param options   ttl
	 * @returns {Promise}
	 */
	set(key, val, options = {}) {
		const pkey = this.prefix + key;

		return new Promise((resolve, reject) => {
			let data = val;
			try {
				data = JSON.stringify(val);
			}
			catch (er) {
			}

			this.client.set(pkey, data, 'EX', options.ttl || this.ttl, (err) => {
				if (err) {
					return reject(err);
				}
				resolve(true);
			});
		});
	}

	/**
	 * 删除某一个key
	 * @param key
	 * @returns {Promise}
	 */
	destroy(key) {
		const pkey = this.prefix + key;

		return new Promise((resolve, reject) => {
			this.client.del(pkey, (err, data)=> {
				if (err) {
					return reject(null);
				}
				return resolve(data);
			});
		});
	}

	/**
	 * 修改某条数据的过期时间
	 * @param key
	 * @param ttl
	 * @returns {Promise}
	 */
	expire(key, ttl) {
		const pkey = this.prefix + key;

		return new Promise((resolve, reject) => {
			this.client.expire(pkey, ttl || this.ttl, (er) => {
				if (er) {
					return reject(er)
				}
				resolve.apply(this, arguments);
			});
		});


	}


}

module.exports = RedisStore;
