import redis

# We calculate Bayesian weighted rating for reviews
def review_weighted_rating(review, review_count, average_review_count, average_review):

    # Calculate according to mathematical formula
    weighted_rating = (review_count / (review_count + average_review_count)) * review + \
                      (average_review_count / (review_count + average_review_count)) * average_review
    
    return weighted_rating



# Function for normalizing a value, converts a number to a value of 0 - 1 according to the min and max values
def normalize(value, min_value, max_value):

    # Prevent division by zero
    if min_value == max_value:
        return 1.0
    return (value - min_value) / (max_value - min_value)



# review is a db in a string, we will convert it to a float
def review_to_float(review):
    return float(review.replace(',', '.'))


def km_to_radians(km, EARTH_RADIUS_KM):
    return km / EARTH_RADIUS_KM

def set_job_progress(job_id, percent, status, REDIS_CONFIG):

    redisDB = redis.Redis(
        host = REDIS_CONFIG.host,
        port = REDIS_CONFIG.port,
        password = REDIS_CONFIG.password,
        decode_responses = True
    )

    if percent is not None:
        redisDB.set(f"job_progress:{job_id}", percent, ex=REDIS_CONFIG.job_expires)
    
    if status is not None:
        redisDB.set(f"job_status:{job_id}", status, ex=REDIS_CONFIG.job_expires)

