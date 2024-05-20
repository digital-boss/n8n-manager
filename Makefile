docker/build:
	docker build -t digitalboss/8man:latest .
	docker build -t digitalboss/8man:$(VER) .

docker/push:
	docker push digitalboss/8man:latest
	docker build -t digitalboss/8man:$(VER) .

clean:
	rm -rf ./workflows/*