const mockedBills = {
    list() {
      return Promise.resolve([{
        "id": "47qAXb6fIm2zOKkLzMro",
        "vat": "80",
        "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        "status": "pending",
        "type": "Hôtel et logement",
        "commentary": "séminaire billed",
        "name": "encore",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "avcd",
        "amount": 400,
        "commentAdmin": "ok",
        "email": "a@a",
        "pct": 20
      },
        {
          "id": "BeKy5Mo4jkmdfPGYpTxZ",
          "vat": "",
          "amount": 100,
          "name": "test1",
          "fileName": "1592770761.jpeg",
          "commentary": "plop",
          "pct": 20,
          "type": "Transports",
          "email": "a@a",
          "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b",
          "date": "gfdgf",
          "status": "refused",
          "commentAdmin": "en fait non"
        }])
  
    },
    create(bill) {
      return Promise.resolve({fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234'})
    },
    update(bill) {
      return Promise.resolve({
        "id": "47qAXb6fIm2zOKkLzMro",
        "vat": "80",
        "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        "status": "pending",
        "type": "Hôtel et logement",
        "commentary": "séminaire billed",
        "name": "encore",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2004-04-04",
        "amount": 400,
        "commentAdmin": "ok",
        "email": "a@a",
        "pct": 20
      })
    },
  }
  
  export default {
    bills() {
      return mockedBills
      //return {}
    },
  }
  
  