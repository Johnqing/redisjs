# 简单的redis客户端

## 创建一个redis的实例

```
const rs = new RedisStore({
  host:'127.0.0.1',
  port: '6379',
  db: 0,
  pass: 'xxxxxxx',
  prefix: 'prefix',
  ttl: 10000
});
```

## 获取某key的数据

```
rs.get('key').then((result) => {
  console.log(result)
});
```

## 插入新数据

```
rs.set('key', {test: 123}, {ttl: 120}).then((result) => {
  console.log(result)
})
.catch((err)=>{
  console.log(err);
})
```

## 删除某key

```
rs.destroy('key').then((result) => {
  console.log(result)
});
```

## 设置过期时间

```
rs.expire('key', 120).then((result) => {
  console.log(result)
});
```
