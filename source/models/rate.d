module models.rate;
import std.datetime;
import hibernated.core;

@Entity
class Rate {
    @NotNull long id;
    @NotNull string currency;
    @NotNull double value;
    @NotNull Date date;

    this(string currency, double value, Date date)
    {
        this.currency = currency;
        this.value = value;
        this.date = date;
    }
}
