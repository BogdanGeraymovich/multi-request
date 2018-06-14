# Multirequest express midelware

## How to use

### Setup routing
```javascript
app.get(SOME_ENDPOINT, multirequest(APPLICATION_DOMAIN));
```


### Make some request
```
HTTP GET SOME_ENDPOINT?key1=edpoint1&key2=endpoint2&key3=endpoint3
```

### Example

#### Call endpoint

```
http://localhost:3000/api/resources?users=api/users&customer=api/customers/23&countries=api/countries
```

#### Return 

```json
{
  "users": {},
  "customer": {},
  "countries": {}
}
```