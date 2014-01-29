/** @file residence.js
 *  @brief model of residence data
 *
 *  @author Kenneth Murphy (kmmurphy)
 */


var Residences = {};

Residences.all = {};

function Residence(){
  this.zpid;
  this.lat;
  this.long;
  this.street;
  this.city;
  this.state;
  this.zipcode;
  this.sqFoot;
  this.lotSize;
  this.taxAssessment;
  this.numBed;
  this.numBath;
  this.priceEst;
  this.greenscore;
}
