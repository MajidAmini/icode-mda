package gov.spawar.icode

class Country {
    static belongsTo = User
    static hasMany = [ callSignPrefixes : CallSignPrefix, maritimeIdDigits : MaritimeIdDigit, users : User ]

    String name;
    String countryCode;

    String toString() { name }

    static constraints = {
        name(unique:true)
        countryCode(unique:true)
        callSignPrefixes()
        maritimeIdDigits()
    }
}
