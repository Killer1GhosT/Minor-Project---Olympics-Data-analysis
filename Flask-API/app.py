from config_database import password, database_name
from flask import Flask, jsonify, render_template, redirect
from sqlalchemy.ext.automap import automap_base
from sqlalchemy import func, desc, distinct
from flask_sqlalchemy import SQLAlchemy

#################################################
# Flask Setup
#################################################

app = Flask(__name__)
app.config['DEBUG'] = True
app.config["TEMPLATES_AUTO_RELOAD"] = True

#################################################
# Database Setup
#################################################

app.config["SQLALCHEMY_DATABASE_URI"] = f"postgresql://postgres:{password}@localhost:5432/{database_name}"
db = SQLAlchemy(app)
db.init_app(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

print(Base.classes.keys())

# Save references to the table in database
Athletes = Base.classes.athletes


#################################################
# Flask Routes
#################################################

# Flask Routes to render HTML
@app.route("/")
def home():
    """Return the homepage."""
    return render_template("index.html")


# @app.route("/olympics/<page_name>")
@app.route("/<page_name>")
def render_webpage(page_name):
    """Render the webpage"""
    return render_template(page_name)
     # return render_template(f'{page_name}.html')


# Flask Route 1
# Query the database and send the jsonified results
@app.route("/api/all-medal-winners")
@app.route("/api/all-medal-winners/<country_name>")
def entire_data_dump(country_name=None):
    """Return the list for all player who won a medal in Olympics based on input parameter"""
    sel = [
            Athletes.games,
            Athletes.country,
            Athletes.name,
            Athletes.sex,
            Athletes.sport,
            Athletes.event,
            Athletes.medal
            ]

    results = db.session.query(*sel).filter(Athletes.medal.isnot(None))
    
    if country_name is not None:
        results = results.filter(Athletes.country.ilike(country_name))
   
    results = results.order_by(Athletes.games, Athletes.country, Athletes.sport, Athletes.event)
    
    all_athletes = []

    for games, country, name, sex, sport, event, medal in results.all():
        altlete_dict = {}
        altlete_dict["name"] = name
        altlete_dict["sex"] = sex
        altlete_dict["country"] = country
        altlete_dict["games"] = games
        altlete_dict["sport"] = sport
        altlete_dict["event"] = event
        altlete_dict["medal"] = medal
        
        all_athletes.append(altlete_dict)

    # Return a list of the column names (sample names)
    return jsonify(all_athletes)



# Flask Route 2
@app.route("/api/medals-tally/<selected_season>/<selected_year>")
def total_medal_tally(selected_season, selected_year):
    """ 
    INPUT: Enter season as summer or winter and Enter selected_year as YYYY
    OUTPUT:
    Return the the total number of gold, silver, bronze and total medals won by all the countries
    in the season and year selected in the route
    """

    subquery = db.session.query(Athletes.games, Athletes.season, Athletes.year,\
                         Athletes.country, Athletes.event, Athletes.medal)\
            .filter(Athletes.medal.isnot(None))\
            .filter(Athletes.year == selected_year)\
            .filter(Athletes.season.ilike(selected_season))\
            .distinct()\
            .subquery()

    medals_query = db.session.query(subquery.c.games, subquery.c.season,\
            subquery.c.year, subquery.c.country,\
            (func.count(subquery.c.medal).label('total_medals')),\
            func.count(subquery.c.medal).filter(subquery.c.medal == "Gold").label('gold_medals'),\
            func.count(subquery.c.medal).filter(subquery.c.medal == "Silver").label('silver_medals'),\
            func.count(subquery.c.medal).filter(subquery.c.medal == "Bronze").label('bronze_medals'))\
            .group_by(subquery.c.games, subquery.c.season,\
                      subquery.c.year, subquery.c.country)\
            .order_by(subquery.c.season, subquery.c.year,\
                      desc('total_medals'))\
            .all()

    all_medals = []

    for games, season, year, country, total_medals, gold, silver, bronze in medals_query:
    
        country_dict= {}
        country_dict["games"] = games
        country_dict["season"] = season
        country_dict["year"] = year
        country_dict["country"] = country
        country_dict["total_medals"] = total_medals
        country_dict["gold"] = gold
        country_dict["silver"] = silver
        country_dict["bronze"] = bronze
        all_medals.append(country_dict)

    return jsonify(all_medals)



# Flask Route 3
@app.route("/api/total-medals")
def total_medals():
    """ 
    Return the the total number of medals won by all the countries in Summer Olympics held after 1980 
    """
    subquery = db.session.query(Athletes.year, Athletes.country, Athletes.event, Athletes.medal)\
        .filter(Athletes.season == 'Summer')\
        .filter(Athletes.year >= 1980)\
        .filter(Athletes.medal.isnot(None))\
        .distinct()\
        .subquery()

    query_result = db.session.query(subquery.c.year, subquery.c.country, \
              func.count(subquery.c.medal).label('total_medals'))\
        .group_by(subquery.c.year, subquery.c.country)\
        .order_by(subquery.c.year, desc('total_medals'))\
        .all()
    
    all_country_medals = []

    for year, country, totalmedals in query_result:
        country_medals = {}
        country_medals["year"] = year
        country_medals["country"] = country
        country_medals["total_medals"] = totalmedals
        all_country_medals.append(country_medals)

    return jsonify(all_country_medals)



# Flask Route 4
@app.route("/api/event/body-composition/<gender>")
def gender_body_composition(gender):
    """
    INPUT: Enter M or F for selecting gender
    OUTPUT: Return the the median age, height and weight of all Gold medal winners for all the events.
    The events are filter based on predefined list of selected sports.
    """
    selected_sports = ('Basketball', 'Boxing', 'Cycling', 'Figure Skating','Gymnastics',\
                        'Judo', 'Swimming',\
                        'Tennis', 'Weightlifting', 'Wrestling')

    results = db.session.query(Athletes.event, Athletes.sport, 
        func.percentile_cont(0.5).within_group(Athletes.age).label('median age'),\
        func.percentile_cont(0.5).within_group(Athletes.height).label('median height'),\
        func.percentile_cont(0.5).within_group(Athletes.weight).label('median weight'))\
        .filter(Athletes.age.isnot(None))\
        .filter(Athletes.height.isnot(None))\
        .filter(Athletes.weight.isnot(None))\
        .filter(Athletes.medal == 'Gold')\
        .filter(Athletes.sex == gender)\
        .filter(Athletes.sport.in_(selected_sports))\
        .group_by(Athletes.event, Athletes.sport)\
        .all()

    event_body_composition = []

    for event, sport, medianAge, medianHeight, medianWeight in results:
        body_composition = {}
        body_composition["event"] = event
        body_composition["sport"] = sport
        body_composition["age"] = medianAge
        body_composition["height"] = medianHeight
        body_composition["weight"] = medianWeight
        event_body_composition.append(body_composition)

    return jsonify(event_body_composition)



# Flask Route 5
@app.route("/api/sport/<selected_sport>")
def sport_medals_country(selected_sport):
    """
    Return the top 10 countries which have won maximum medal in particular sport over all the years.
    """
    subquery = db.session.query(Athletes.year, Athletes.country,\
             Athletes.sport, Athletes.medal)\
            .filter(Athletes.medal.isnot(None))\
            .distinct()\
            .subquery()

    results = db.session.query(subquery.c.sport, subquery.c.country,\
            func.count(subquery.c.medal).label("medals_won"))\
            .filter(subquery.c.sport.ilike(selected_sport))\
            .group_by(subquery.c.sport, subquery.c.country)\
            .order_by(subquery.c.sport, desc("medals_won"))\
            .limit(10)\
            .all()

    sport_countries = []

    for sport, country, medals in results:
        country_dict = {}
        country_dict["sport"] = sport
        country_dict["country"] = country
        country_dict["medals"] = medals
        sport_countries.append(country_dict)
    
    return jsonify(sport_countries)



# Flask Route 6
@app.route("/api/sport/year_wise_count")
def sport_year_wise():
    """
    Return the total number of distinct sports for each year
    """
    results = db.session.query(Athletes.year, Athletes.season,\
                       func.count(distinct(Athletes.sport)).label('total_sports'))\
            .group_by(Athletes.year, Athletes.season).all()

    year_sport_count = []
    for year, season, year_count in results:
        year_sport_dict = {}
        year_sport_dict["year"] = year
        year_sport_dict["season"] = season
        year_sport_dict["sport_count"] = year_count
        year_sport_count.append(year_sport_dict)

    return jsonify(year_sport_count)



# Flask Route 7
@app.route("/api/medals-tally/years_after_1960")
def total_medal_tally_year_after_1960():
    """ 
    Return the the total number of gold, silver, bronze and total medals won by all the countries after year 1960
    """

    subquery = db.session.query(Athletes.games, Athletes.season, Athletes.year,\
                         Athletes.country, Athletes.event, Athletes.medal)\
            .filter(Athletes.medal.isnot(None))\
            .filter(Athletes.year >= 1960)\
            .distinct()\
            .subquery()

    medals_query = db.session.query(subquery.c.games, subquery.c.season,\
            subquery.c.year, subquery.c.country,\
            (func.count(subquery.c.medal).label('total_medals')),\
            func.count(subquery.c.medal).filter(subquery.c.medal == "Gold").label('gold_medals'),\
            func.count(subquery.c.medal).filter(subquery.c.medal == "Silver").label('silver_medals'),\
            func.count(subquery.c.medal).filter(subquery.c.medal == "Bronze").label('bronze_medals'))\
            .group_by(subquery.c.games, subquery.c.season,\
                      subquery.c.year, subquery.c.country)\
            .order_by(subquery.c.season, subquery.c.year,\
                      desc('total_medals'))\
            .all()

    all_medals = []

    for games, season, year, country, total_medals, gold, silver, bronze in medals_query:
    
        country_dict= {}
        country_dict["Season"] = season
        country_dict["Year"] = year
        country_dict["Nation"] = country
        country_dict["Medals"] = total_medals
        country_dict["Gold"] = gold
        country_dict["Silver"] = silver
        country_dict["Bronze"] = bronze
        all_medals.append(country_dict)

    return jsonify(all_medals)



# Flask Route 8
@app.route("/api/sport/year_season_sport")
def sport_year_season():
    """
    Return the sports in olympics for each olympic year and season
    """
    results = db.session.query(Athletes.year, Athletes.season,Athletes.sport)\
            .group_by(Athletes.year, Athletes.season, Athletes.sport)\
            .order_by(Athletes.year, Athletes.season)\
            .all()

    year_sport_count = []
    for year, season, sport_name in results:
        year_sport_dict = {}
        year_sport_dict["year"] = year
        year_sport_dict["season"] = season
        year_sport_dict["sport_count"] = sport_name
        year_sport_count.append(year_sport_dict)

    return jsonify(year_sport_count)



# Flask Route 9
@app.route("/api/sport/country/<selected_country>")
def country_sport_medal(selected_country):
    """
    Return the total number of medals won (sport wise) by the 
    """

    subquery = db.session.query(Athletes.year, Athletes.country, Athletes.sport, Athletes.medal)\
        .filter(Athletes.medal.isnot(None))\
        .distinct()\
        .subquery()

    results = db.session.query(subquery.c.country, subquery.c.sport, \
              func.count(subquery.c.medal).label('medals_won'))\
        .filter(subquery.c.country.ilike(selected_country))\
        .group_by(subquery.c.country, subquery.c.sport)\
        .order_by(subquery.c.country, desc('medals_won'))\
        .limit(10)\
        .all()

    country_sport = []
    for country, sport, medals_won in results:
        country_sport_dict = {}
        country_sport_dict["country"] = country
        country_sport_dict["sport"] = sport
        country_sport_dict["medals_won"] = medals_won
        country_sport.append(country_sport_dict)

    return jsonify(country_sport)



if __name__ == '__main__':
    app.run()